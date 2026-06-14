import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import CircleOverlay from '../components/CircleOverlay';
import { BlurBar, PillButton } from '../components/ui';
import { useCircle } from '../lib/useCircle';
import { colors, space } from '../theme';

interface Props {
  uri: string | null;
  onBack: () => void;
}

/** 후보정: 사진 위에 원 프레이밍 + 비네팅(원 밖 어둡게) → ViewShot로 합성 후 내보내기. */
export default function EditScreen({ uri, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [photo, setPhoto] = useState<string | null>(uri);
  const [vignette, setVignette] = useState(true);
  const shotRef = useRef<View>(null);
  const circle = useCircle(width, height);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  };

  const exportImage = async (mode: 'save' | 'share') => {
    if (!photo) return;
    try {
      const out = await captureRef(shotRef, { format: 'jpg', quality: 0.95 });
      if (mode === 'save') {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('저장 권한 필요', '권한을 허용해 주세요.');
          return;
        }
        await MediaLibrary.saveToLibraryAsync(out);
        Alert.alert('저장됨', '보정한 사진을 저장했습니다.');
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(out);
      }
    } catch (e) {
      Alert.alert('내보내기 실패', String(e));
    }
  };

  if (!photo) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>후보정할 사진 선택</Text>
        <Text style={styles.sub}>갤러리에서 사진을 불러와 원 프레이밍을 입혀보세요.</Text>
        <PillButton label="사진 불러오기" variant="primary" onPress={pick} />
        <PillButton label="← 카메라로" onPress={onBack} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View ref={shotRef} collapsable={false} style={StyleSheet.absoluteFill}>
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="contain" />
        <CircleOverlay width={width} height={height} circle={circle} vignette={vignette} color={colors.white} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]} pointerEvents="box-none">
        <BlurBar style={styles.bar}>
          <View style={styles.row}>
            <PillButton label="← 카메라" onPress={onBack} flex />
            <PillButton
              label={vignette ? '◑ 비네팅' : '○ 비네팅'}
              variant={vignette ? 'active' : 'ghost'}
              onPress={() => setVignette((v) => !v)}
              flex
            />
            <PillButton label="다른 사진" onPress={pick} flex />
          </View>
          <View style={[styles.row, { marginTop: space.sm }]}>
            <PillButton label="공유" onPress={() => exportImage('share')} flex />
            <PillButton label="저장" variant="primary" onPress={() => exportImage('save')} flex />
          </View>
        </BlurBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg },
  bar: { borderRadius: 22, borderWidth: 1, borderColor: colors.hair, padding: space.lg },
  row: { flexDirection: 'row', gap: space.sm },
});
