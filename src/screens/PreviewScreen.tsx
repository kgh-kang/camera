import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface Props {
  uri: string;
  onRetake: () => void;
  onEdit: (uri: string) => void;
}

export default function PreviewScreen({ uri, onRetake, onEdit }: Props) {
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('저장 권한 필요', '사진을 저장하려면 권한을 허용해 주세요.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('저장됨', '사진 앱에 저장했습니다.');
    } catch (e) {
      Alert.alert('저장 실패', String(e));
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <View style={[styles.bar, { paddingBottom: insets.bottom + 18, paddingTop: insets.top + 10 }]}>
        <View style={styles.row}>
          <Btn label="다시찍기" onPress={onRetake} />
          <Btn label="후보정" onPress={() => onEdit(uri)} />
          <Btn label="공유" onPress={share} />
          <Btn label={saving ? '저장중…' : '저장'} primary onPress={save} />
        </View>
      </View>
    </View>
  );
}

function Btn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity style={[styles.btn, primary && styles.btnPrimary]} onPress={onPress}>
      <Text style={[styles.btnTxt, primary && { color: '#062018' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: colors.panel },
  btnPrimary: { backgroundColor: colors.accent, borderColor: 'transparent' },
  btnTxt: { color: colors.txt, fontSize: 13, fontWeight: '600' },
});
