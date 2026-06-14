import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import CircleOverlay from '../components/CircleOverlay';
import { BlurBar, Pill, PillButton, RoundIconButton, Shutter, Tip } from '../components/ui';
import { computeFit, type FitState } from '../lib/match';
import { useCircleDetector } from '../lib/useCircleDetector';
import { useCircle } from '../lib/useCircle';
import type { Settings } from '../lib/useSettings';
import { colors, ratios, space } from '../theme';

interface Props {
  onCaptured: (uri: string) => void;
  onPickForEdit: (uri: string) => void;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

// 프레임 정규화좌표 → 화면 정규화좌표 (8가지: 회전 4 × 미러 2). 사용자가 버튼으로 맞춤.
function orient(nx: number, ny: number, idx: number) {
  let x = nx;
  let y = ny;
  const rot = idx & 3;
  if (rot === 1) {
    const t = x;
    x = y;
    y = 1 - t;
  } else if (rot === 2) {
    x = 1 - x;
    y = 1 - y;
  } else if (rot === 3) {
    const t = x;
    x = 1 - y;
    y = t;
  }
  if (idx & 4) x = 1 - x;
  return { x, y };
}

const stateColor: Record<FitState, string> = {
  idle: colors.idle,
  near: colors.near,
  good: colors.good,
};

export default function CameraScreen({ onCaptured, onPickForEdit, settings, update }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const { grid, ratioIdx, guide } = settings;
  const [fit, setFit] = useState<{ score: number; state: FitState; hint: string }>({
    score: 0,
    state: 'idle',
    hint: '',
  });
  const [ghost, setGhost] = useState<{ x: number; y: number; r: number } | null>(null);

  const device = useCameraDevice(position);
  const cameraRef = useRef<Camera>(null);
  const circle = useCircle(width, height);
  const { frameProcessor, subjectRef } = useCircleDetector();

  // circle은 매 렌더 새 객체 → ref로 고정해 인터벌 재생성을 막는다
  const circleRef = useRef(circle);
  circleRef.current = circle;
  const wasGood = useRef(false);
  const orientRef = useRef(settings.orientIdx);
  orientRef.current = settings.orientIdx;

  // 정렬 계산 루프 (~11fps): 검출 결과 + 원 위치로 fit/힌트 산출
  useEffect(() => {
    if (!guide) {
      wasGood.current = false;
      setFit({ score: 0, state: 'idle', hint: '' });
      setGhost(null);
      return;
    }
    const id = setInterval(() => {
      const s = subjectRef.current;
      const c = circleRef.current.snapshot();
      if (!s) {
        wasGood.current = false;
        setFit({ score: 0, state: 'idle', hint: '' });
        setGhost(null);
        return;
      }
      const mapped = orient(s.nx, s.ny, orientRef.current);
      const subj = { px: mapped.x * width, py: mapped.y * height, pr: s.nr * Math.min(width, height) };
      setGhost({ x: subj.px, y: subj.py, r: subj.pr });
      const f = computeFit({ cx: c.cx, cy: c.cy, r: c.r }, subj);
      const dx = subj.px - c.cx;
      const dy = subj.py - c.cy;
      let hint = '';
      if (f.state === 'good') hint = '✓';
      else if (Math.hypot(dx, dy) > c.r * 0.18) hint = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '→' : '←') : dy > 0 ? '↓' : '↑';
      if (f.state === 'good' && !wasGood.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      wasGood.current = f.state === 'good';
      setFit({ score: f.score, state: f.state, hint });
    }, 90);
    return () => clearInterval(id);
  }, [guide, width, height, subjectRef]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permTitle}>카메라 권한이 필요해요</Text>
        <Text style={styles.permSub}>원 안에 피사체를 맞춰 촬영하려면 카메라 접근을 허용해 주세요.</Text>
        <PillButton label="권한 허용" variant="primary" onPress={requestPermission} />
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.permSub}>사용 가능한 카메라를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const ratio = ratios[ratioIdx].value;
  const frameH = Math.min(height, width / ratio);
  const barH = Math.max(0, (height - frameH) / 2);
  const color = stateColor[fit.state];

  const onShutter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const photo = await cameraRef.current?.takePhoto({ flash: 'off' });
      if (photo?.path) onCaptured(photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`);
    } catch (e) {
      console.warn('takePhoto failed', e);
    }
  };

  const openLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) onPickForEdit(res.assets[0].uri);
  };

  return (
    <View style={styles.root}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
        frameProcessor={guide && position === 'back' ? frameProcessor : undefined}
      />

      {barH > 0 && (
        <>
          <View style={[styles.bar, { top: 0, height: barH }]} pointerEvents="none" />
          <View style={[styles.bar, { bottom: 0, height: barH }]} pointerEvents="none" />
        </>
      )}

      <CircleOverlay
        width={width}
        height={height}
        circle={circle}
        showGrid={grid}
        color={color}
        fit={guide ? fit.score : undefined}
        hint={guide ? fit.hint : ''}
        detected={guide ? ghost : null}
      />

      {/* 상단 HUD */}
      <View style={[styles.hud, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <View style={styles.hudLeft}>
          <Pill label={ratios[ratioIdx].label} />
          {guide && (
            <Pressable onPress={() => update({ orientIdx: (settings.orientIdx + 1) % 8 })}>
              <Pill label={`방향 ${settings.orientIdx}`} />
            </Pressable>
          )}
        </View>
        {guide && fit.state !== 'idle' && (
          <Pill label={`${Math.round(fit.score * 100)}%`} tone={fit.state === 'good' ? 'accent' : undefined} />
        )}
        <Pill label="촬영" />
      </View>

      {/* 하단 컨트롤 */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]} pointerEvents="box-none">
        <BlurBar style={[styles.controlBar]}>
          <View style={styles.ctrlRow}>
            <RoundIconButton icon="▦" active={grid} onPress={() => update({ grid: !grid })} />
            <RoundIconButton icon="⤢" onPress={() => update({ ratioIdx: (ratioIdx + 1) % ratios.length })} />
            <Shutter onPress={onShutter} />
            <RoundIconButton icon="◎" active={guide} onPress={() => update({ guide: !guide })} />
            <RoundIconButton icon="⟲" onPress={() => setPosition((p) => (p === 'back' ? 'front' : 'back'))} />
          </View>
          <Tip>◎ 둥근 물체 자동 인식(점선) · 원을 거기 맞추면 초록 · 방향 어긋나면 상단 '방향' 탭</Tip>
        </BlurBar>
        <View style={styles.loadRow}>
          <PillButton label="🖼  갤러리에서 보정" onPress={openLibrary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  permTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  permSub: { color: colors.textDim, fontSize: 14, textAlign: 'center' },
  bar: { position: 'absolute', left: 0, right: 0, backgroundColor: '#000' },
  hud: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, alignItems: 'center', gap: space.md },
  controlBar: { width: '100%', borderRadius: 22, borderWidth: 1, borderColor: colors.hair, paddingHorizontal: space.lg, paddingVertical: space.lg },
  ctrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loadRow: { width: '100%' },
});
