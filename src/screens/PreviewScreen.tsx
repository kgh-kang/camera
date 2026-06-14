import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurBar, PillButton } from '../components/ui';
import { colors, space } from '../theme';

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
      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <BlurBar style={styles.bar}>
          <View style={styles.row}>
            <PillButton label="다시찍기" onPress={onRetake} flex />
            <PillButton label="후보정" onPress={() => onEdit(uri)} flex />
            <PillButton label="공유" onPress={share} flex />
            <PillButton label={saving ? '저장중…' : '저장'} variant="primary" onPress={save} flex />
          </View>
        </BlurBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg },
  bar: { borderRadius: 22, borderWidth: 1, borderColor: colors.hair, padding: space.md },
  row: { flexDirection: 'row', gap: space.sm },
});
