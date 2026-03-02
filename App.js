import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwake } from 'expo-keep-awake';

import DebugScreen from './src/screens/DebugScreen';
import ThrowScreen from './src/screens/ThrowScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { useThrowHistory } from './src/hooks/useThrowHistory';

activateKeepAwake();

export default function App() {
  const [showDebug, setShowDebug] = useState(false);
  const { throws, addThrow, deleteThrow } = useThrowHistory();
  const { width } = Dimensions.get('window');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: width, animated: false });
  }, [width]);

  if (showDebug) {
    return (
      <View style={styles.container}>
        <DebugScreen />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowDebug(false)}
        >
          <Text style={styles.toggleText}>Back to Throw</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.page, { width }]}>
          <HistoryScreen throws={throws} onDeleteThrow={deleteThrow} />
        </View>
        <View style={[styles.page, { width }]}>
          <ThrowScreen
            onShowDebug={() => setShowDebug(true)}
            onThrowComplete={addThrow}
            recentThrows={throws.slice(0, 5)}
          />
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
  },
});
