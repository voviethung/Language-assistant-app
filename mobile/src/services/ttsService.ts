/**
 * TTS Service
 * Uses react-native-tts (wraps Android TTS / iOS AVSpeechSynthesizer)
 * Falls back to OpenAI TTS API for premium voice quality.
 */

import Tts from 'react-native-tts';
import {Platform} from 'react-native';

export type SupportedLang = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'es';

const TTS_LOCALES: Record<SupportedLang, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await Tts.setDefaultRate(0.5);
  await Tts.setDefaultPitch(1.0);
  initialized = true;
}

export async function speak(text: string, lang: SupportedLang): Promise<void> {
  if (!text.trim()) return;
  await ensureInit();

  const locale = TTS_LOCALES[lang] ?? 'en-US';

  if (Platform.OS === 'android') {
    await Tts.setDefaultLanguage(locale);
  } else {
    await Tts.setDefaultLanguage(locale);
  }

  Tts.stop();
  Tts.speak(text);
}

export function stopSpeaking(): void {
  Tts.stop();
}
