import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import {useSettingsStore, LANGUAGE_LABELS, SupportedLang} from '@/store/settingsStore';

const LANGUAGES = Object.keys(LANGUAGE_LABELS) as SupportedLang[];

interface Props {
  type: 'source' | 'target';
}

export default function LanguagePicker({type}: Props) {
  const {sourceLang, targetLang, setSourceLang, setTargetLang} = useSettingsStore();
  const [open, setOpen] = useState(false);
  const current = type === 'source' ? sourceLang : targetLang;
  const setter = type === 'source' ? setSourceLang : setTargetLang;

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setOpen(true)}>
        <Text style={styles.flag}>{getFlagEmoji(current)}</Text>
        <Text style={styles.label}>{LANGUAGE_LABELS[current]}</Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Language</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={l => l}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.item, item === current && styles.itemActive]}
                  onPress={() => {setter(item); setOpen(false);}}>
                  <Text style={styles.itemFlag}>{getFlagEmoji(item)}</Text>
                  <Text style={[styles.itemLabel, item === current && styles.itemLabelActive]}>
                    {LANGUAGE_LABELS[item]}
                  </Text>
                  {item === current && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function getFlagEmoji(lang: SupportedLang): string {
  const flags: Record<SupportedLang, string> = {
    en: '🇺🇸', vi: '🇻🇳', zh: '🇨🇳', ja: '🇯🇵',
    ko: '🇰🇷', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸',
  };
  return flags[lang] ?? '🌐';
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  flag: {fontSize: 18},
  label: {flex: 1, fontSize: 14, color: '#374151', fontWeight: '500'},
  arrow: {color: '#9ca3af', fontSize: 12},
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  sheetTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111827'},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  itemActive: {backgroundColor: '#e0e7ff'},
  itemFlag: {fontSize: 22},
  itemLabel: {flex: 1, fontSize: 15, color: '#374151'},
  itemLabelActive: {color: '#6366f1', fontWeight: '600'},
  check: {color: '#6366f1', fontSize: 16},
});
