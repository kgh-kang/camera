import { BlurView } from 'expo-blur';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, type } from '../theme';

/** 반투명 블러 바 (상·하단 컨트롤 컨테이너) */
export function BlurBar({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <BlurView intensity={24} tint="dark" style={[styles.blurBar, style]}>
      {children}
    </BlurView>
  );
}

/** 상단 상태 칩 */
export function Pill({ label, tone }: { label: string; tone?: 'accent' }) {
  return (
    <View style={[styles.pill, tone === 'accent' && styles.pillAccent]}>
      <Text style={[styles.pillTxt, tone === 'accent' && { color: colors.accentInk }]}>{label}</Text>
    </View>
  );
}

/** 원형 아이콘 버튼 */
export function RoundIconButton({
  icon,
  onPress,
  active,
  size = 46,
}: {
  icon: string;
  onPress: () => void;
  active?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.roundActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.roundIcon, active && { color: colors.accentInk }]}>{icon}</Text>
    </Pressable>
  );
}

/** 알약형 텍스트 버튼 */
export function PillButton({
  label,
  onPress,
  variant = 'ghost',
  flex,
}: {
  label: string;
  onPress: () => void;
  variant?: 'ghost' | 'primary' | 'active';
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillBtn,
        flex && { flex: 1 },
        variant === 'primary' && styles.pillBtnPrimary,
        variant === 'active' && styles.pillBtnActive,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text
        style={[
          styles.pillBtnTxt,
          variant === 'primary' && { color: colors.accentInk },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** 셔터 버튼 (액센트 링) */
export function Shutter({
  onPress,
  busy,
  tone = 'white',
}: {
  onPress: () => void;
  busy?: boolean;
  tone?: 'white' | 'accent';
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shutterRing, pressed && { transform: [{ scale: 0.93 }] }]}>
      <View style={[styles.shutterCore, tone === 'accent' && { backgroundColor: colors.accent }]}>
        {busy && <ActivityIndicator color={colors.ink} />}
      </View>
    </Pressable>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return <Text style={styles.tip}>{children}</Text>;
}

const styles = StyleSheet.create({
  blurBar: { overflow: 'hidden' },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hair,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pillAccent: { backgroundColor: colors.accent, borderColor: 'transparent' },
  pillTxt: { color: colors.text, fontSize: type.label, fontWeight: '600' },
  round: {
    borderWidth: 1,
    borderColor: colors.hair,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundActive: { backgroundColor: colors.accent, borderColor: 'transparent' },
  roundIcon: { color: colors.white, fontSize: 18 },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hair,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnPrimary: { backgroundColor: colors.accent, borderColor: 'transparent' },
  pillBtnActive: { backgroundColor: 'rgba(67,214,163,0.22)', borderColor: colors.accent },
  pillBtnTxt: { color: colors.text, fontSize: type.label, fontWeight: '600' },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  tip: { color: 'rgba(255,255,255,0.72)', fontSize: type.tip, textAlign: 'center', marginTop: 10 },
});
