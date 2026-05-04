import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AudioRecord from 'react-native-audio-record';
import {useSettingsStore, LANGUAGE_LABELS} from '@/store/settingsStore';
import {useHistoryStore} from '@/store/historyStore';
import {transcribeAudio} from '@/services/sttService';
import {translate} from '@/services/translateService';
import {speak, stopSpeaking} from '@/services/ttsService';
import LanguagePicker from '@/components/LanguagePicker';
import ResultCard from '@/components/ResultCard';
import type {RootStackParamList} from '@/navigation/RootNavigator';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type RecordingState = 'idle' | 'recording' | 'processing';

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {sourceLang, targetLang, swapLangs} = useSettingsStore();
  const {addSession} = useHistoryStore();

  const [state, setState] = useState<RecordingState>('idle');
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');

  const startRecording = useCallback(async () => {
    try {
      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6, // MIC
        wavFile: 'audio.wav',
      });
      AudioRecord.start();
      setState('recording');
    } catch (e) {
      Alert.alert('Microphone Error', 'Cannot access microphone. Check permissions.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setState('processing');
    try {
      const path = await AudioRecord.stop();
      setAudioPath(path);

      const sttResult = await transcribeAudio(path, sourceLang, targetLang);
      setTranscript(sttResult.text);

      // If STT already returned translation (from Argos on server), use it
      // Otherwise run client-side translate
      let finalTranslation = sttResult.translation;
      if (!finalTranslation && sttResult.text) {
        finalTranslation = await translate(sttResult.text, sourceLang, targetLang);
      }
      setTranslation(finalTranslation);

      addSession({
        transcript: sttResult.text,
        translation: finalTranslation,
        sourceLang,
        targetLang,
        audioUri: path,
      });
    } catch (e) {
      Alert.alert('Error', 'Processing failed. Please try again.');
    } finally {
      setState('idle');
    }
  }, [sourceLang, targetLang, addSession]);

  const handleSpeakTranslation = useCallback(() => {
    if (translation) speak(translation, targetLang);
  }, [translation, targetLang]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language selector */}
        <View style={styles.langRow}>
          <LanguagePicker type="source" />
          <TouchableOpacity style={styles.swapBtn} onPress={swapLangs}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>
          <LanguagePicker type="target" />
        </View>

        {/* Record button */}
        <View style={styles.recordContainer}>
          {state === 'processing' ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : (
            <TouchableOpacity
              style={[styles.recordBtn, state === 'recording' && styles.recordBtnActive]}
              onPress={state === 'idle' ? startRecording : stopRecording}
              activeOpacity={0.8}>
              <Text style={styles.recordIcon}>{state === 'recording' ? '⏹' : '🎙'}</Text>
              <Text style={styles.recordLabel}>
                {state === 'recording' ? 'Tap to stop' : 'Tap to record'}
              </Text>
            </TouchableOpacity>
          )}

          {state === 'recording' && (
            <Text style={styles.recordingHint}>Listening in {LANGUAGE_LABELS[sourceLang]}...</Text>
          )}
        </View>

        {/* Results */}
        {transcript ? (
          <ResultCard
            transcript={transcript}
            translation={translation}
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSpeak={handleSpeakTranslation}
            onStopSpeak={stopSpeaking}
          />
        ) : null}

        {/* Live conversation shortcut */}
        <TouchableOpacity
          style={styles.conversationBtn}
          onPress={() => navigation.navigate('Conversation')}>
          <Text style={styles.conversationBtnText}>🗣 Start Live Conversation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  scroll: {padding: 16, gap: 16},
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  swapBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  swapIcon: {fontSize: 20},
  recordContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordBtnActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  recordIcon: {fontSize: 48},
  recordLabel: {color: '#fff', fontSize: 13, marginTop: 4},
  recordingHint: {marginTop: 12, color: '#6b7280', fontSize: 14},
  conversationBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conversationBtnText: {fontSize: 15, color: '#6366f1', fontWeight: '600'},
});
