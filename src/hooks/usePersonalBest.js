import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@altitude_personal_best';

export function usePersonalBest() {
  const [personalBestMeters, setPersonalBestMeters] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const val = parseFloat(stored);
      if (Number.isFinite(val)) setPersonalBestMeters(val);
    });
  }, []);

  const updateIfBetter = useCallback(async (newMeters) => {
    if (!Number.isFinite(newMeters) || newMeters <= 0) return false;
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored != null ? parseFloat(stored) : 0;
    if (!Number.isFinite(current)) return false;
    if (newMeters > current) {
      await AsyncStorage.setItem(STORAGE_KEY, String(newMeters));
      setPersonalBestMeters(newMeters);
      return true;
    }
    return false;
  }, []);

  const personalBestFeet = personalBestMeters != null
    ? personalBestMeters * 3.28084
    : null;

  return {
    personalBestMeters,
    personalBestFeet,
    updateIfBetter,
  };
}
