import {create} from 'zustand';

export interface TranslationSession {
  id: string;
  transcript: string;
  translation: string;
  sourceLang: string;
  targetLang: string;
  audioUri?: string;
  createdAt: number;
  synced: boolean;
}

interface HistoryState {
  sessions: TranslationSession[];
  addSession: (session: Omit<TranslationSession, 'id' | 'createdAt' | 'synced'>) => void;
  markSynced: (id: string) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  sessions: [],

  addSession: (session) => {
    const newSession: TranslationSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: Date.now(),
      synced: false,
    };
    set({sessions: [newSession, ...get().sessions].slice(0, 200)});
  },

  markSynced: (id) => {
    set({
      sessions: get().sessions.map(s => s.id === id ? {...s, synced: true} : s),
    });
  },

  clearAll: () => set({sessions: []}),
}));
