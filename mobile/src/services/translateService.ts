/**
 * Translation Service
 * Multi-layer strategy (spec §6):
 *   1. Phrasebook (exact match)
 *   2. Memory cache (session)
 *   3. Remote Argos (self-hosted Docker)
 *   4. Groq LLM fallback
 *
 * Pivot strategy: Any lang → EN → Any lang
 */

import {phrasebook} from './phrasebook';
import {translationCache} from './translationCache';

const STT_URL = process.env.STT_URL ?? 'https://internship.pharmacountry.com';
const STT_KEY = process.env.STT_KEY ?? '';
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';

export type SupportedLang = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'es';

// Argos supports these pairs directly (via pivot EN if pair not available)
const DIRECT_PAIRS = new Set([
  'en-vi', 'vi-en',
  'en-zh', 'zh-en',
  'en-ja', 'ja-en',
  'en-ko', 'ko-en',
  'en-fr', 'fr-en',
  'en-de', 'de-en',
  'en-es', 'es-en',
]);

export async function translate(
  text: string,
  source: SupportedLang,
  target: SupportedLang,
): Promise<string> {
  if (!text.trim() || source === target) return text;

  // 1. Phrasebook
  const phrase = phrasebook.find(text, source, target);
  if (phrase) return phrase;

  // 2. Memory cache
  const cached = translationCache.get(text, source, target);
  if (cached) return cached;

  // 3. Argos remote (pivot through EN if needed)
  try {
    const result = await _translateArgos(text, source, target);
    if (result) {
      translationCache.set(text, source, target, result);
      return result;
    }
  } catch {
    // fall through
  }

  // 4. Groq LLM fallback
  try {
    const result = await _translateGroq(text, source, target);
    translationCache.set(text, source, target, result);
    return result;
  } catch {
    return text; // last resort: return original
  }
}

async function _translateArgos(
  text: string,
  source: SupportedLang,
  target: SupportedLang,
): Promise<string | null> {
  const pairKey = `${source}-${target}`;

  // Direct pair available
  if (DIRECT_PAIRS.has(pairKey)) {
    return _argosRequest(text, source, target);
  }

  // Pivot: source → EN → target
  let pivot = text;
  if (source !== 'en') {
    const toEn = await _argosRequest(text, source, 'en');
    if (!toEn) return null;
    pivot = toEn;
  }
  if (target === 'en') return pivot;
  return _argosRequest(pivot, 'en', target);
}

async function _argosRequest(
  text: string,
  source: string,
  target: string,
): Promise<string | null> {
  const res = await fetch(`${STT_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shared-Key': STT_KEY,
    },
    body: JSON.stringify({text, source_lang: source, target_lang: target}),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.translated_text ?? null;
}

async function _translateGroq(
  text: string,
  source: SupportedLang,
  target: SupportedLang,
): Promise<string> {
  const prompt = `Translate the following text from ${source} to ${target}. Return only the translated text, no explanation.\n\n${text}`;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{role: 'user', content: prompt}],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });
  if (!res.ok) throw new Error('Groq translate failed');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? text;
}
