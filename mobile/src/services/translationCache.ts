/**
 * In-memory translation cache (session-scoped).
 * Key: sha-like hash of text + source + target
 * Evicts oldest entry when exceeding MAX_SIZE.
 */

const MAX_SIZE = 500;

class TranslationCache {
  private cache = new Map<string, string>();

  private key(text: string, source: string, target: string): string {
    return `${source}|${target}|${text}`;
  }

  get(text: string, source: string, target: string): string | null {
    return this.cache.get(this.key(text, source, target)) ?? null;
  }

  set(text: string, source: string, target: string, result: string): void {
    if (this.cache.size >= MAX_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(this.key(text, source, target), result);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const translationCache = new TranslationCache();
