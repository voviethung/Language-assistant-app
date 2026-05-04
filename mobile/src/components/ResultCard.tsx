import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {LANGUAGE_LABELS} from '@/store/settingsStore';
import type {SupportedLang} from '@/store/settingsStore';

interface Props {
  transcript: string;
  translation: string;
  sourceLang: SupportedLang;
  targetLang: SupportedLang;
  onSpeak: () => void;
  onStopSpeak: () => void;
}

export default function ResultCard({
  transcript,
  translation,
  sourceLang,
  targetLang,
  onSpeak,
  onStopSpeak,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Original */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{LANGUAGE_LABELS[sourceLang]}</Text>
        <Text style={styles.transcriptText} selectable>{transcript}</Text>
      </View>

      {translation ? (
        <>
          <View style={styles.divider} />
          {/* Translation */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{LANGUAGE_LABELS[targetLang]}</Text>
            <Text style={styles.translationText} selectable>{translation}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onSpeak}>
              <Text style={styles.actionBtnText}>🔊 Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={onStopSpeak}>
              <Text style={styles.actionBtnTextSecondary}>⏹ Stop</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  section: {gap: 6},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transcriptText: {fontSize: 16, color: '#111827', lineHeight: 24},
  translationText: {fontSize: 16, color: '#374151', lineHeight: 24},
  divider: {height: 1, backgroundColor: '#f3f4f6', marginVertical: 12},
  actions: {flexDirection: 'row', gap: 8, marginTop: 12},
  actionBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  actionBtnSecondary: {backgroundColor: '#f3f4f6'},
  actionBtnText: {color: '#fff', fontWeight: '600'},
  actionBtnTextSecondary: {color: '#374151', fontWeight: '600'},
});
