import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { heightAtTime } from '../utils/physics';

const GRAPH_WIDTH = 260;
const GRAPH_HEIGHT = 100;
const PADDING = { left: 36, right: 16, top: 16, bottom: 28 };

export default function TrajectoryGraph({
  heightMeters,
  heightFeet,
  airtimeMs,
  useFeet,
  accentColor = '#0284c7',
}) {
  const { path, peakPoint, unit, maxHeight } = useMemo(() => {
    if (
      heightMeters == null ||
      heightFeet == null ||
      airtimeMs == null ||
      airtimeMs <= 0
    ) {
      return { path: '', peakPoint: null, unit: 'ft', maxHeight: 0 };
    }

    const T = airtimeMs / 1000;
    const H = useFeet ? heightFeet : heightMeters;
    const unit = useFeet ? 'ft' : 'm';

    const w = GRAPH_WIDTH - PADDING.left - PADDING.right;
    const h = GRAPH_HEIGHT - PADDING.top - PADDING.bottom;

    const points = [];
    const samples = 24;
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * T;
      const ht = heightAtTime(t, H, T);
      const x = PADDING.left + (t / T) * w;
      const y = PADDING.top + h - (ht / H) * h;
      points.push(`${x},${y}`);
    }

    const pathD = `M ${points.join(' L ')}`;
    const peakX = PADDING.left + w / 2;
    const peakY = PADDING.top; // peak is at top of arc (max height)

    return {
      path: pathD,
      peakPoint: { x: peakX, y: peakY },
      unit,
      maxHeight: H,
    };
  }, [heightMeters, heightFeet, airtimeMs, useFeet]);

  if (!path || maxHeight <= 0) return null;

  const bgColor = `${accentColor}20`;
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accentColor }]}>Your trajectory</Text>
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={[styles.svg, { backgroundColor: bgColor }]}>
        <Path
          d={path}
          stroke={accentColor}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {peakPoint && (
          <Circle
            cx={peakPoint.x}
            cy={peakPoint.y}
            r={6}
            fill={accentColor}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </Svg>
      <View style={styles.axisLabels}>
        <Text style={[styles.axisText, { color: accentColor }]}>0s</Text>
        <Text style={[styles.axisText, { color: accentColor }]}>{(airtimeMs / 1000).toFixed(2)}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  svg: {
    borderRadius: 12,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GRAPH_WIDTH - PADDING.left - PADDING.right,
    marginLeft: PADDING.left,
    marginTop: 4,
  },
  axisText: {
    fontSize: 11,
  },
});
