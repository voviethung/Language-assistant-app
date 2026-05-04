/**
 * Live Conversation Screen
 * Real-time speech-to-speech:
 *   User A speaks → STT → Translate → TTS → User B hears
 * Both sides displayed simultaneously.
 */

import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AudioRecord from 'react-native-audio-record';
import {useSettingsStore, LANGUAGE_LABELS} from '@/store/settingsStore';
import {transcribeAudio} from '@/services/sttService';
import {translate} from '@/services/translateService';
import {speak} from '@/services/ttsService';

interface Message {
  id: string;
  speaker: 'A' | 'B';
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

type Side = 'A' | 'B';

export default function ConversationScreen() {
  const {sourceLang, targetLang} = useSettingsStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSide, setActiveSide] = useState<Side | null>(null);
  const [processing, setProcessing] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Side A speaks sourceLang, side B speaks targetLang
  const startRecording = useCallback(async (side: Side) => {
    if (activeSide) return;
    setActiveSide(side);
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: `conv_${side}.wav`,
    });
    AudioRecord.start();
  }, [activeSide]);

  const stopRecording = useCallback(async (side: Side) => {
    if (activeSide !== side) return;
    setActiveSide(null);
    setProcessing(true);

    try {
      const path = await AudioRecord.stop();
      const from = side === 'A' ? sourceLang : targetLang;
      const to = side === 'A' ? targetLang : sourceLang;

      const sttResult = await transcribeAudio(path, from, to);
      let translated = sttResult.translation;
      if (!translated && sttResult.text) {
        translated = await translate(sttResult.text, from, to);
      }

      const msg: Message = {
        id: Date.now().toString(),
        speaker: side,
        original: sttResult.text,
        translated,
        sourceLang: from,
        targetLang: to,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, msg]);
      // Auto-speak the translation to the other side
      speak(translated, to);
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
    } finally {
      setProcessing(false);
    }
  }, [activeSide, sourceLang, targetLang]);

  const renderMessage = useCallback(({item}: {item: Message}) => {
    const isA = item.speaker === 'A';
    return (
      <View style={[styles.bubble, isA ? styles.bubbleA : styles.bubbleB]}>
        <Text style={styles.bubbleSpeaker}>
          {isA ? `🙋 ${LANGUAGE_LABELS[item.sourceLang]}` : `🙋 ${LANGUAGE_LABELS[item.sourceLang]}`}
        </Text>
        <Text style={styles.bubbleOriginal}>{item.original}</Text>
        <View style={styles.bubbleDivider} />
        <Text style={styles.bubbleTranslated}>{item.translated}</Text>
        <Text style={styles.bubbleLang}>→ {LANGUAGE_LABELS[item.targetLang]}</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {LANGUAGE_LABELS[sourceLang]} ⇄ {LANGUAGE_LABELS[targetLang]}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tap a button below to start speaking</Text>
        }
      />

      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator color="#6366f1" />
          <Text style={styles.processingText}>Translating...</Text>
        </View>
      )}

      {/* Two speaker buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.speakBtn, activeSide === 'A' && styles.speakBtnActive]}
          onPressIn={() => startRecording('A')}
          onPressOut={() => stopRecording('A')}
          disabled={!!activeSide && activeSide !== 'A'}>
          <Text style={styles.speakBtnIcon}>{activeSide === 'A' ? '🔴' : '🎙'}</Text>
          <Text style={styles.speakBtnLabel}>
            {LANGUAGE_LABELS[sourceLang]}
          </Text>
          <Text style={styles.speakBtnHint}>Hold to speak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.speakBtn, activeSide === 'B' && styles.speakBtnActive]}
          onPressIn={() => startRecording('B')}
          onPressOut={() => stopRecording('B')}
          disabled={!!activeSide && activeSide !== 'B'}>
          <Text style={styles.speakBtnIcon}>{activeSide === 'B' ? '🔴' : '🎙'}</Text>
          <Text style={styles.speakBtnLabel}>
            {LANGUAGE_LABELS[targetLang]}
          </Text>
          <Text style={styles.speakBtnHint}>Hold to speak</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  header: {
    padding: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  headerText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  list: {padding: 16, gap: 12, flexGrow: 1},
  emptyText: {textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 15},
  bubble: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
  },
  bubbleA: {
    backgroundColor: '#e0e7ff',
    alignSelf: 'flex-start',
  },
  bubbleB: {
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-end',
  },
  bubbleSpeaker: {fontSize: 11, color: '#6b7280', marginBottom: 4},
  bubbleOriginal: {fontSize: 15, color: '#111827', fontWeight: '500'},
  bubbleDivider: {height: 1, backgroundColor: '#e5e7eb', marginVertical: 6},
  bubbleTranslated: {fontSize: 15, color: '#374151'},
  bubbleLang: {fontSize: 11, color: '#9ca3af', marginTop: 4},
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  processingText: {color: '#6366f1'},
  buttons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  speakBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  speakBtnActive: {backgroundColor: '#ef4444'},
  speakBtnIcon: {fontSize: 28},
  speakBtnLabel: {color: '#fff', fontSize: 13, fontWeight: '600'},
  speakBtnHint: {color: '#c7d2fe', fontSize: 11},
});
