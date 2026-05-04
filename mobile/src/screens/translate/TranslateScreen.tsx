import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSettingsStore, LANGUAGE_LABELS} from '@/store/settingsStore';
import {translate} from '@/services/translateService';
import {speak} from '@/services/ttsService';
import LanguagePicker from '@/components/LanguagePicker';

export default function TranslateScreen() {
  const {sourceLang, targetLang, swapLangs} = useSettingsStore();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const translated = await translate(inputText, sourceLang, targetLang);
      setResult(translated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Language selector */}
        <View style={styles.langRow}>
          <LanguagePicker type="source" />
          <TouchableOpacity style={styles.swapBtn} onPress={swapLangs}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>
          <LanguagePicker type="target" />
        </View>

        {/* Input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{LANGUAGE_LABELS[sourceLang]}</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Enter text to translate..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.translateBtn, !inputText.trim() && styles.translateBtnDisabled]}
            onPress={handleTranslate}
            disabled={!inputText.trim() || loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.translateBtnText}>Translate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Output */}
        {result ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{LANGUAGE_LABELS[targetLang]}</Text>
            <Text style={styles.resultText} selectable>{result}</Text>
            <TouchableOpacity
              style={styles.speakBtn}
              onPress={() => speak(result, targetLang)}>
              <Text style={styles.speakBtnText}>🔊 Speak</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    elevation: 2,
  },
  swapBtn: {padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6'},
  swapIcon: {fontSize: 20},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    elevation: 2,
  },
  cardLabel: {fontSize: 12, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase'},
  input: {
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
  },
  translateBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  translateBtnDisabled: {backgroundColor: '#c7d2fe'},
  translateBtnText: {color: '#fff', fontWeight: '600', fontSize: 15},
  resultText: {fontSize: 16, color: '#111827', lineHeight: 24},
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  speakBtnText: {color: '#374151', fontSize: 14},
});
