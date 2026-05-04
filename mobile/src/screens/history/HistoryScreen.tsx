import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useHistoryStore} from '@/store/historyStore';
import {LANGUAGE_LABELS} from '@/store/settingsStore';
import {speak} from '@/services/ttsService';
import type {SupportedLang} from '@/store/settingsStore';

export default function HistoryScreen() {
  const {sessions, clearAll} = useHistoryStore();

  if (!sessions.length) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.empty}>No history yet. Record something first!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerCount}>{sessions.length} sessions</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearBtn}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLang}>
                {LANGUAGE_LABELS[item.sourceLang as SupportedLang]} → {LANGUAGE_LABELS[item.targetLang as SupportedLang]}
              </Text>
              <Text style={styles.cardTime}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.transcript}>{item.transcript}</Text>
            {item.translation ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.translation}>{item.translation}</Text>
                <TouchableOpacity
                  style={styles.speakBtn}
                  onPress={() => speak(item.translation, item.targetLang as SupportedLang)}>
                  <Text style={styles.speakBtnText}>🔊</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  empty: {textAlign: 'center', marginTop: 80, color: '#9ca3af', fontSize: 15},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerCount: {color: '#6b7280', fontSize: 14},
  clearBtn: {color: '#ef4444', fontSize: 14},
  list: {padding: 16, gap: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  cardLang: {fontSize: 12, color: '#6366f1', fontWeight: '600'},
  cardTime: {fontSize: 12, color: '#9ca3af'},
  transcript: {fontSize: 15, color: '#111827'},
  divider: {height: 1, backgroundColor: '#f3f4f6', marginVertical: 8},
  translation: {fontSize: 15, color: '#374151'},
  speakBtn: {alignSelf: 'flex-end', padding: 6},
  speakBtnText: {fontSize: 18},
});
