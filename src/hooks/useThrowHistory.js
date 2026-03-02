import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@altitude_throw_history';
const MAX_ITEMS = 100;

export function useThrowHistory() {
  const [throws, setThrows] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      try {
        const parsed = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) setThrows(parsed);
      } catch {
        setThrows([]);
      }
    });
  }, []);

  const addThrow = useCallback(async ({ heightMeters, heightFeet, airtimeMs }) => {
    if (!Number.isFinite(heightMeters) || heightMeters <= 0) return;
    const record = {
      id: Date.now().toString(),
      heightMeters,
      heightFeet,
      airtimeMs,
      timestamp: Date.now(),
    };
    setThrows((prev) => {
      const next = [record, ...prev].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteThrow = useCallback(async (id) => {
    setThrows((prev) => {
      const next = prev.filter((t) => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { throws, addThrow, deleteThrow };
}
