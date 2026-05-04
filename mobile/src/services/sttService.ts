/**
 * STT Service
 * Routes audio to:
 *   1. Remote Docker tunnel (default) — faster-whisper + Argos
 *   2. Fallback to Groq Whisper API when tunnel is down
 */

import Config from 'react-native-config';

const STT_URL = Config.STT_URL ?? 'https://internship.pharmacountry.com';
const STT_KEY = Config.STT_KEY ?? '';
const GROQ_API_KEY = Config.GROQ_API_KEY ?? '';

export interface STTResult {
  text: string;
  translation: string;
  source_lang: string;
  quality_score?: number;
}

export async function transcribeAudio(
  audioPath: string,
  sourceLang: string,
  targetLang: string,
): Promise<STTResult> {
  // Try self-hosted tunnel first
  try {
    const health = await fetch(`${STT_URL}/health`, {signal: AbortSignal.timeout(3000)});
    if (health.ok) {
      return await _transcribeRemote(audioPath, sourceLang, targetLang);
    }
  } catch {
    // tunnel unavailable, fall through to cloud
  }

  // Fallback: Groq Whisper
  return await _transcribeGroq(audioPath, sourceLang, targetLang);
}

async function _transcribeRemote(
  audioPath: string,
  sourceLang: string,
  targetLang: string,
): Promise<STTResult> {
  const form = new FormData();
  form.append('file', {
    uri: audioPath,
    name: 'audio.wav',
    type: 'audio/wav',
  } as unknown as Blob);
  form.append('source_lang', sourceLang);
  form.append('target_lang', targetLang);

  const res = await fetch(`${STT_URL}/transcribe`, {
    method: 'POST',
    headers: {'X-Shared-Key': STT_KEY},
    body: form,
  });

  if (!res.ok) {
    throw new Error(`STT remote error: ${res.status}`);
  }

  return res.json();
}

async function _transcribeGroq(
  audioPath: string,
  _sourceLang: string,
  _targetLang: string,
): Promise<STTResult> {
  const form = new FormData();
  form.append('file', {
    uri: audioPath,
    name: 'audio.wav',
    type: 'audio/wav',
  } as unknown as Blob);
  form.append('model', 'whisper-large-v3-turbo');
  form.append('response_format', 'json');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {Authorization: `Bearer ${GROQ_API_KEY}`},
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Groq STT error: ${res.status}`);
  }

  const data = await res.json();
  return {
    text: data.text ?? '',
    translation: '',  // Groq doesn't translate, will be handled by translate service
    source_lang: _sourceLang,
    quality_score: 1,
  };
}
