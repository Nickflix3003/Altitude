import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COUNT_UP_DURATION = 600;

export default function HeightDisplay({
  heightMeters,
  heightFeet,
  useFeet,
  onToggleUnit,
  accentColor = '#0284c7',
}) {
  const displayValue = useFeet ? heightFeet : heightMeters;
  const unit = useFeet ? 'ft' : 'm';

  const [shownValue, setShownValue] = useState(0);

  useEffect(() => {
    if (displayValue == null) {
      setShownValue(0);
      return;
    }

    setShownValue(0);

    const start = Date.now();
    const run = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / COUNT_UP_DURATION);
      const eased = 1 - Math.pow(1 - t, 2); // ease-out
      const v = displayValue * eased;
      setShownValue(v);
      if (t < 1) requestAnimationFrame(run);
      else setShownValue(displayValue);
    };
    requestAnimationFrame(run);
  }, [displayValue]);

  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color: accentColor }]}>
        {displayValue != null ? shownValue.toFixed(1) : '--'}
      </Text>
      <Text style={[styles.unit, { color: accentColor }]}>{unit}</Text>
      {displayValue != null && (
        <TouchableOpacity style={styles.toggle} onPress={onToggleUnit}>
          <Text style={[styles.toggleText, { color: accentColor }]}>
            Show in {useFeet ? 'meters' : 'feet'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 26,
    marginTop: 4,
    fontWeight: '600',
  },
  toggle: {
    marginTop: 12,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
