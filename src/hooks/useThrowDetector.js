import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { heightFromAirtime } from '../utils/physics';

const FREEFALL_THRESHOLD = 0.3; // g - below this = freefall (relaxed to catch earlier)
const CATCH_THRESHOLD = 1.3; // g - above this = caught/landed (relaxed to capture full airtime)
const MIN_FREEFALL_MS = 200; // Ignore very short "freefalls" (noise)

export const STATE_IDLE = 'IDLE';
export const STATE_ARMED = 'ARMED';
export const STATE_FREEFALL = 'FREEFALL';
export const STATE_DONE = 'DONE';

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Hook that detects freefall and calculates throw height.
 * @param {boolean} armed - When true, start listening for freefall
 * @returns {{ state, heightMeters, heightFeet, airtimeMs, reset }}
 */
export function useThrowDetector(armed) {
  const [state, setState] = useState(STATE_IDLE);
  const [heightMeters, setHeightMeters] = useState(null);
  const [heightFeet, setHeightFeet] = useState(null);
  const [airtimeMs, setAirtimeMs] = useState(null);
  const freefallStartRef = useRef(null);

  const reset = useCallback(() => {
    setState(STATE_IDLE);
    freefallStartRef.current = null;
    setHeightMeters(null);
    setHeightFeet(null);
    setAirtimeMs(null);
  }, []);

  useEffect(() => {
    if (!armed) {
      setState(STATE_IDLE);
      freefallStartRef.current = null;
      return;
    }

    setState(STATE_ARMED);
    freefallStartRef.current = null;

    let subscription = null;
    Accelerometer.setUpdateInterval(16);

    const handleReading = (data) => {
      const mag = magnitude(data.x, data.y, data.z);

      setState((prev) => {
        if (prev === STATE_ARMED) {
          if (mag < FREEFALL_THRESHOLD) {
            freefallStartRef.current = Date.now();
            return STATE_FREEFALL;
          }
          return prev;
        }

        if (prev === STATE_FREEFALL) {
          if (mag > CATCH_THRESHOLD) {
            const start = freefallStartRef.current ?? Date.now();
            const durationMs = Date.now() - start;

            if (durationMs >= MIN_FREEFALL_MS) {
              const airtimeSec = durationMs / 1000;
              const { meters, feet } = heightFromAirtime(airtimeSec);
              setHeightMeters(meters);
              setHeightFeet(feet);
              setAirtimeMs(durationMs);
            }

            return STATE_DONE;
          }
          return prev;
        }

        return prev;
      });
    };

    subscription = Accelerometer.addListener(handleReading);

    return () => {
      if (subscription) subscription.remove();
    };
  }, [armed]);

  return {
    state,
    heightMeters,
    heightFeet,
    airtimeMs,
    reset,
  };
}
