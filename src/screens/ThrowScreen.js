import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HeightDisplay from '../components/HeightDisplay';
import ThrowButton from '../components/ThrowButton';
import TrajectoryGraph from '../components/TrajectoryGraph';
import {
  useThrowDetector,
  STATE_IDLE,
  STATE_ARMED,
  STATE_FREEFALL,
  STATE_DONE,
} from '../hooks/useThrowDetector';
import { usePersonalBest } from '../hooks/usePersonalBest';
import { getFunMessage } from '../utils/funMessages';
import { getColorForHeight } from '../utils/heightColors';

function formatTimeAgo(timestamp) {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export default function ThrowScreen({
  onShowDebug,
  onThrowComplete,
  recentThrows = [],
}) {
  const [armed, setArmed] = useState(false);
  const [useFeet, setUseFeet] = useState(true);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;

  const { state, heightMeters, heightFeet, airtimeMs, reset } =
    useThrowDetector(armed);
  const { personalBestFeet, personalBestMeters, updateIfBetter } =
    usePersonalBest();

  useEffect(() => {
    if (state === STATE_DONE && heightMeters != null) {
      updateIfBetter(heightMeters).then((newRecord) => {
        setIsNewRecord(newRecord);
      });
      onThrowComplete?.({
        heightMeters,
        heightFeet,
        airtimeMs,
      });
    }
  }, [state, heightMeters]);

  useEffect(() => {
    if (state === STATE_DONE && heightMeters != null) {
      cardOpacity.setValue(0);
      cardScale.setValue(0.9);
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state, heightMeters]);

  const handleArmPress = () => {
    setIsNewRecord(false);
    if (state === STATE_DONE) {
      setArmed(false);
      reset();
      setTimeout(() => setArmed(true), 50);
    } else {
      setArmed(true);
    }
  };

  const buttonLabel = state === STATE_DONE ? 'Again. Go higher.' : null;
  const isButtonDisabled = state === STATE_ARMED || state === STATE_FREEFALL;

  const displayHeight = useFeet ? heightFeet : heightMeters;
  const funMessage = getFunMessage(heightFeet ?? 0);
  const personalBest = useFeet ? personalBestFeet : personalBestMeters;
  const accentColor = displayHeight != null ? getColorForHeight(heightFeet ?? 0) : '#0284c7';

  return (
    <LinearGradient
      colors={['#e0f2fe', '#bae6fd', '#7dd3fc']}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <Text style={styles.swipeHint}>Swipe right for history</Text>
        <TouchableOpacity onPress={onShowDebug}>
          <Text style={styles.debugLinkText}>Sensor Debug</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        {state === STATE_DONE && displayHeight != null ? (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
                borderColor: accentColor,
                shadowColor: accentColor,
              },
            ]}
          >
            {isNewRecord && (
              <View style={styles.pbBadge}>
                <Text style={styles.pbBadgeText}>New personal best!</Text>
              </View>
            )}
            <HeightDisplay
              heightMeters={heightMeters}
              heightFeet={heightFeet}
              useFeet={useFeet}
              onToggleUnit={() => setUseFeet((f) => !f)}
              accentColor={accentColor}
            />
            <TrajectoryGraph
              heightMeters={heightMeters}
              heightFeet={heightFeet}
              airtimeMs={airtimeMs}
              useFeet={useFeet}
              accentColor={accentColor}
            />
            <View style={styles.statsRow}>
              <Text style={[styles.airtimeText, { color: accentColor }]}>
                Airtime: {(airtimeMs / 1000).toFixed(2)}s
              </Text>
              {personalBest != null && (
                <Text style={[styles.pbText, { color: accentColor }]}>
                  Best: {personalBest.toFixed(1)} {useFeet ? 'ft' : 'm'}
                </Text>
              )}
            </View>
            {funMessage && (
              <Text style={[styles.funMessage, { color: accentColor }]}>
                {funMessage}
              </Text>
            )}
          </Animated.View>
        ) : (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderValue}>
              {state === STATE_ARMED || state === STATE_FREEFALL
                ? '...'
                : '--'}
            </Text>
            <Text style={styles.placeholderUnit}>
              {useFeet ? 'ft' : 'm'}
            </Text>
            {personalBest != null && state === STATE_IDLE && (
              <Text style={styles.pbHint}>
                You've "managed" {personalBest.toFixed(1)} {useFeet ? 'ft' : 'm'} before.
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.statusText}>
          {state === STATE_IDLE && "What are you waiting for?"}
          {state === STATE_ARMED && "Throw it! Do it!"}
          {state === STATE_FREEFALL && "There it goes..."}
          {state === STATE_DONE && "Don't drop it!"}
        </Text>
      </View>

      {recentThrows.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent</Text>
          <View style={styles.recentRow}>
            {recentThrows.slice(0, 4).map((t) => {
              const chipColor = getColorForHeight(t.heightFeet);
              return (
                <View
                  key={t.id}
                  style={[styles.recentChip, { borderColor: chipColor }]}
                >
                  <Text style={[styles.recentHeight, { color: chipColor }]}>
                    {(useFeet ? t.heightFeet : t.heightMeters).toFixed(1)}
                  </Text>
                  <Text style={styles.recentUnit}>
                    {useFeet ? 'ft' : 'm'} · {formatTimeAgo(t.timestamp)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.buttonSection}>
        <ThrowButton
          state={state}
          disabled={isButtonDisabled}
          onPress={handleArmPress}
          label={buttonLabel}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  swipeHint: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '600',
  },
  debugLinkText: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '600',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
  },
  pbBadge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  pbBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  airtimeText: {
    fontSize: 14,
    color: '#0284c7',
    marginRight: 16,
  },
  pbText: {
    fontSize: 14,
    color: '#0ea5e9',
  },
  funMessage: {
    fontSize: 16,
    color: '#0284c7',
    marginTop: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  placeholderSection: {
    alignItems: 'center',
  },
  placeholderValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#7dd3fc',
    fontVariant: ['tabular-nums'],
  },
  placeholderUnit: {
    fontSize: 24,
    color: '#38bdf8',
    marginTop: 4,
  },
  pbHint: {
    fontSize: 14,
    color: '#0369a1',
    marginTop: 12,
  },
  statusSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
    minHeight: 28,
  },
  recentSection: {
    marginBottom: 20,
    width: '100%',
    maxWidth: 340,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  recentHeight: {
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  recentUnit: {
    fontSize: 11,
    color: '#0ea5e9',
    marginTop: 2,
  },
  statusText: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonSection: {
    alignItems: 'center',
  },
});
