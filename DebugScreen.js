import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

export default function DebugScreen() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;

    const init = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        setAvailable(isAvailable);

        if (!isAvailable) {
          setError('Accelerometer is not available on this device.');
          return;
        }

        Accelerometer.setUpdateInterval(16); // Request ~60Hz
        subscription = Accelerometer.addListener(setData);
      } catch (err) {
        setError(err.message || 'Failed to access accelerometer');
      }
    };

    init();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const mag = magnitude(data.x, data.y, data.z);
  const inFreefall = mag < 0.2;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.hint}>
          Make sure you're testing on a physical device (not simulator).
        </Text>
      </View>
    );
  }

  if (available === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Accelerometer not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor Debug</Text>
      <Text style={styles.hint}>Raw accelerometer (g-force)</Text>

      <View style={styles.dataRow}>
        <Text style={styles.label}>X:</Text>
        <Text style={styles.value}>{data.x.toFixed(3)}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Y:</Text>
        <Text style={styles.value}>{data.y.toFixed(3)}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Z:</Text>
        <Text style={styles.value}>{data.z.toFixed(3)}</Text>
      </View>

      <View style={styles.magnitudeSection}>
        <Text style={styles.label}>Magnitude:</Text>
        <Text style={[styles.magnitude, inFreefall && styles.freefall]}>
          {mag.toFixed(3)} g
        </Text>
        {inFreefall && (
          <Text style={styles.freefallLabel}>~ FREEFALL (~0g)</Text>
        )}
      </View>

      <Text style={styles.footer}>
        At rest: ~1g. During freefall: ~0g. Toss your phone to test.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  magnitudeSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  magnitude: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginTop: 8,
  },
  freefall: {
    color: '#22c55e',
  },
  freefallLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  error: {
    fontSize: 18,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
