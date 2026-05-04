import {create} from 'zustand';

export type SupportedLang = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'es';

export const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

interface SettingsState {
  sourceLang: SupportedLang;
  targetLang: SupportedLang;
  sttMode: 'remote' | 'local';  // remote = Docker tunnel, local = on-device (future)
  setSourceLang: (lang: SupportedLang) => void;
  setTargetLang: (lang: SupportedLang) => void;
  swapLangs: () => void;
  setSttMode: (mode: 'remote' | 'local') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  sourceLang: 'en',
  targetLang: 'vi',
  sttMode: 'remote',

  setSourceLang: (lang) => set({sourceLang: lang}),
  setTargetLang: (lang) => set({targetLang: lang}),

  swapLangs: () => {
    const {sourceLang, targetLang} = get();
    set({sourceLang: targetLang, targetLang: sourceLang});
  },

  setSttMode: (mode) => set({sttMode: mode}),
}));
