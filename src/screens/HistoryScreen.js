import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSectionLabel(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

import { getColorForHeight } from '../utils/heightColors';

function ThrowItem({ item, useFeet, isPersonalBest, onDelete }) {
  const height = useFeet ? item.heightFeet : item.heightMeters;
  const unit = useFeet ? 'ft' : 'm';
  const accentColor = getColorForHeight(item.heightFeet);

  const handleDelete = () => {
    Alert.alert(
      'Delete throw',
      `Remove ${height.toFixed(1)} ${unit} from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <View
      style={[
        styles.item,
        isPersonalBest && styles.itemBest,
        { borderLeftColor: accentColor },
      ]}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          {isPersonalBest && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>Best</Text>
            </View>
          )}
          <Text style={[styles.itemHeight, { color: accentColor }]}>
            {height.toFixed(1)} {unit}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemAirtime}>
              {(item.airtimeMs / 1000).toFixed(2)}s airtime
            </Text>
            <Text style={styles.itemDate}>{formatDate(item.timestamp)}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HistoryScreen({ throws, onDeleteThrow }) {
  const [useFeet, setUseFeet] = useState(true);

  const { stats, sections } = useMemo(() => {
    if (throws.length === 0) {
      return { stats: null, sections: [] };
    }

    const bestMeters = Math.max(...throws.map((t) => t.heightMeters));
    const avgMeters =
      throws.reduce((s, t) => s + t.heightMeters, 0) / throws.length;
    const avgFeet = avgMeters * 3.28084;

    const bySection = {};
    throws.forEach((t) => {
      const label = getSectionLabel(t.timestamp);
      if (!bySection[label]) bySection[label] = [];
      bySection[label].push(t);
    });

    const sectionOrder = ['Today', 'Yesterday'];
    const otherLabels = Object.keys(bySection)
      .filter((l) => !sectionOrder.includes(l))
      .sort((a, b) => {
        const tsA = bySection[a][0]?.timestamp || 0;
        const tsB = bySection[b][0]?.timestamp || 0;
        return tsB - tsA;
      });
    const orderedLabels = [
      ...sectionOrder.filter((l) => bySection[l]),
      ...otherLabels,
    ];

    const sections = orderedLabels.map((label) => ({
      label,
      items: bySection[label],
    }));

    return {
      stats: {
        total: throws.length,
        bestMeters,
        bestFeet: bestMeters * 3.28084,
        avgMeters,
        avgFeet,
      },
      sections,
    };
  }, [throws]);

  return (
    <LinearGradient
      colors={['#fdf4ff', '#fae8ff', '#fce7f3']}
      style={styles.container}
    >
      <LinearGradient
        colors={['#a855f7', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Throw history</Text>
        <View style={styles.headerRow}>
          <Text style={styles.hint}>Swipe left to throw</Text>
          <TouchableOpacity
            onPress={() => setUseFeet((f) => !f)}
            style={styles.unitToggle}
          >
            <Text style={styles.unitToggleText}>{useFeet ? 'ft' : 'm'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {throws.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>↑</Text>
          <Text style={styles.emptyText}>No throws yet</Text>
          <Text style={styles.emptyHint}>
            Complete a throw on the main screen, then swipe right to see it here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['#8b5cf6', '#a855f7']}
              style={[styles.statCard, styles.statCardFirst]}
            >
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#ec4899', '#f43f5e']}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>
                {(useFeet ? stats.bestFeet : stats.bestMeters).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Best</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#06b6d4', '#0ea5e9']}
              style={[styles.statCard, styles.statCardLast]}
            >
              <Text style={styles.statValue}>
                {(useFeet ? stats.avgFeet : stats.avgMeters).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg</Text>
            </LinearGradient>
          </View>

          {sections.map(({ label, items }) => (
            <View key={label} style={styles.section}>
              <Text style={styles.sectionTitle}>{label}</Text>
              {items.map((item, idx) => (
                <ThrowItem
                  key={item.id}
                  item={item}
                  useFeet={useFeet}
                  isPersonalBest={item.heightMeters === stats.bestMeters}
                  onDelete={onDeleteThrow ?? (() => {})}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  unitToggle: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
  },
  unitToggleText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  statCardFirst: {},
  statCardLast: {
    marginRight: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flex: 1,
  },
  itemBest: {
    borderLeftColor: '#ec4899',
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ec4899',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  bestBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemHeight: {
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  itemMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  itemAirtime: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 16,
  },
  itemDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 8,
    marginTop: -4,
    marginRight: -4,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#d8b4fe',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#a855f7',
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 15,
    color: '#c084fc',
    marginTop: 12,
    textAlign: 'center',
  },
});
