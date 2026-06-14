import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import CircleOverlay from '../components/CircleOverlay';
import { colors, ratios } from '../theme';

interface Props {
  onCaptured: (uri: string) => void;
  onPickForEdit: (uri: string) => void;
}

export default function CameraScreen({ onCaptured, onPickForEdit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [grid, setGrid] = useState(false);
  const [ratioIdx, setRatioIdx] = useState(0);
  const device = useCameraDevice(position);
  const cameraRef = useRef<Camera>(null);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permTitle}>카메라 권한이 필요해요</Text>
        <Text style={styles.permSub}>원 안에 피사체를 맞춰 촬영하려면 카메라 접근을 허용해 주세요.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnTxt}>권한 허용</Text>
        </TouchableOpacity>
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

  // 비율 레터박스: 9:16은 거의 전체, 1:1/4:5는 위아래 바
  const ratio = ratios[ratioIdx].value; // w/h
  const frameH = Math.min(height, width / ratio);
  const barH = Math.max(0, (height - frameH) / 2);

  const onShutter = async () => {
    try {
      const photo = await cameraRef.current?.takePhoto({ flash: 'off' });
      if (photo?.path) {
        const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
        onCaptured(uri);
      }
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
      />

      {/* 비율 레터박스 */}
      {barH > 0 && (
        <>
          <View style={[styles.bar, { top: 0, height: barH }]} pointerEvents="none" />
          <View style={[styles.bar, { bottom: 0, height: barH }]} pointerEvents="none" />
        </>
      )}

      {/* 타겟 원 오버레이 */}
      <CircleOverlay width={width} height={height} showGrid={grid} color={colors.idle} />

      {/* 상단 HUD */}
      <View style={[styles.hud, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.pill}>
          <Text style={styles.pillTxt}>{ratios[ratioIdx].label}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillTxt}>촬영</Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 18 }]} pointerEvents="box-none">
        <View style={styles.ctrlRow}>
          <IconBtn label="▦" active={grid} onPress={() => setGrid((g) => !g)} />
          <IconBtn label="⤢" onPress={() => setRatioIdx((i) => (i + 1) % ratios.length)} />
          <Pressable style={styles.shutter} onPress={onShutter} />
          <IconBtn label="⟲" onPress={() => setPosition((p) => (p === 'back' ? 'front' : 'back'))} />
          <IconBtn label="🖼" onPress={openLibrary} />
        </View>
        <Text style={styles.tip}>원을 끌어 위치 · 핀치/핸들로 크기 · 가운데 버튼으로 촬영</Text>
      </View>
    </View>
  );
}

function IconBtn({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.iconBtn, active && styles.iconBtnActive]} onPress={onPress}>
      <Text style={[styles.iconTxt, active && { color: '#111' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 28 },
  permTitle: { color: colors.txt, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  permSub: { color: colors.mut, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  permBtn: { backgroundColor: colors.accent, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  permBtnTxt: { color: '#062018', fontWeight: '700' },
  bar: { position: 'absolute', left: 0, right: 0, backgroundColor: '#000' },
  hud: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  pill: { backgroundColor: 'rgba(8,10,14,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillTxt: { color: '#dfe6ef', fontSize: 12 },
  controls: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 16 },
  ctrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: { backgroundColor: '#fff' },
  iconTxt: { color: '#fff', fontSize: 18 },
  shutter: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 5, borderColor: 'rgba(255,255,255,0.4)' },
  tip: { color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'center', marginTop: 12 },
});
