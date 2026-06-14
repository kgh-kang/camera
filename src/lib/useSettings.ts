import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Settings {
  guide: boolean; // L2 정렬 가이드 on/off
  grid: boolean;
  ratioIdx: number;
  orientIdx: number; // 프레임↔화면 방향 보정(0~7), 기기별로 사용자가 맞춤
  onboarded: boolean;
}

const DEFAULTS: Settings = { guide: true, grid: false, ratioIdx: 0, orientIdx: 0, onboarded: false };
const KEY = 'cc.settings.v1';

/** 사용자 설정을 AsyncStorage에 영속 저장한다. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v) setSettings({ ...DEFAULTS, ...JSON.parse(v) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { settings, update, loaded };
}
