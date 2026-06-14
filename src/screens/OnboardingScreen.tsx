import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermission } from 'react-native-vision-camera';
import { PillButton } from '../components/ui';
import { colors, space } from '../theme';

const POINTS = [
  { icon: '⭕', title: '원을 올린다', desc: '화면의 동그라미를 끌어 위치를 잡고, 핀치로 크기를 맞춰요.' },
  { icon: '🎯', title: '피사체를 맞춘다', desc: '게이지와 화살표가 원에 피사체를 맞춰가도록 가이드해요.' },
  { icon: '📸', title: '직접 찍는다', desc: '셔터는 당신이. 못 맞췄으면 후보정에서 원 프레이밍을 입혀요.' },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { requestPermission } = useCameraPermission();

  const start = async () => {
    try {
      await requestPermission();
    } catch {
      // 권한 거부해도 진행 — 카메라 화면에서 다시 안내
    }
    onDone();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.hero}>
        <Image source={require('../../assets/splash-icon.png')} style={styles.mark} resizeMode="contain" />
        <Text style={styles.title}>Circle Camera</Text>
        <Text style={styles.subtitle}>동그라미에 피사체를 맞춰 찍는 카메라</Text>
      </View>

      <View style={styles.points}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <Text style={styles.pIcon}>{p.icon}</Text>
            <View style={styles.pText}>
              <Text style={styles.pTitle}>{p.title}</Text>
              <Text style={styles.pDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.cta}>
        <PillButton label="시작하기" variant="primary" onPress={start} flex />
        <Text style={styles.note}>모든 처리는 기기 안에서만 이뤄지고, 사진은 어디에도 전송되지 않아요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: space.xl, justifyContent: 'space-between' },
  hero: { alignItems: 'center', gap: space.sm },
  mark: { width: 96, height: 96 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: space.sm },
  subtitle: { color: colors.textDim, fontSize: 15 },
  points: { gap: space.lg },
  point: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  pIcon: { fontSize: 26, width: 36, textAlign: 'center' },
  pText: { flex: 1 },
  pTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  pDesc: { color: colors.textDim, fontSize: 13, lineHeight: 18 },
  cta: { gap: space.md },
  note: { color: colors.textDim, fontSize: 11, textAlign: 'center', paddingHorizontal: space.lg },
});
