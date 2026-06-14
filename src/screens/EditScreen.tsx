import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import CircleOverlay from '../components/CircleOverlay';
import { colors } from '../theme';

interface Props {
  uri: string | null;
  onBack: () => void;
}

/**
 * 후보정: 사진 위에 원 프레이밍 + 원 밖 어둡게(비네팅) 효과 → 내보내기.
 * 합성은 ViewShot로 화면(이미지+오버레이)을 캡처해 새 이미지로 저장한다.
 */
export default function EditScreen({ uri, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [photo, setPhoto] = useState<string | null>(uri);
  const [vignette, setVignette] = useState(true);
  const shotRef = useRef<View>(null);

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
        <TouchableOpacity style={styles.primary} onPress={pick}>
          <Text style={styles.primaryTxt}>사진 불러오기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghost} onPress={onBack}>
          <Text style={styles.ghostTxt}>← 카메라로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View ref={shotRef} collapsable={false} style={StyleSheet.absoluteFill}>
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="contain" />
        <CircleOverlay width={width} height={height} vignette={vignette} color="#fff" />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 18, paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <View style={styles.row}>
          <Btn label="← 카메라" onPress={onBack} />
          <Btn label={vignette ? '◑ 비네팅 ON' : '○ 비네팅 OFF'} active={vignette} onPress={() => setVignette((v) => !v)} />
          <Btn label="다른 사진" onPress={pick} />
          <Btn label="공유" onPress={() => exportImage('share')} />
          <Btn label="저장" primary onPress={() => exportImage('save')} />
        </View>
      </View>
    </View>
  );
}

function Btn({
  label,
  onPress,
  primary,
  active,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.btn, primary && styles.btnPrimary, active && styles.btnActive]} onPress={onPress}>
      <Text style={[styles.btnTxt, primary && { color: '#062018' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { color: colors.txt, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sub: { color: colors.mut, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  primary: { backgroundColor: colors.accent, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  primaryTxt: { color: '#062018', fontWeight: '700' },
  ghost: { paddingVertical: 10 },
  ghostTxt: { color: colors.mut, fontSize: 14 },
  controls: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  btn: { flex: 1, paddingVertical: 11, borderRadius: 11, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: colors.panel },
  btnPrimary: { backgroundColor: colors.accent, borderColor: 'transparent' },
  btnActive: { backgroundColor: 'rgba(67,214,163,0.25)' },
  btnTxt: { color: colors.txt, fontSize: 12, fontWeight: '600' },
});
