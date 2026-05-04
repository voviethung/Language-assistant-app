import {create} from 'zustand';
import {Session} from '@supabase/supabase-js';
import {supabase} from '@/services/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,

  initialize: async () => {
    const {data} = await supabase.auth.getSession();
    set({session: data.session, loading: false});

    supabase.auth.onAuthStateChange((_event, session) => {
      set({session});
    });
  },

  signIn: async (email, password) => {
    const {error} = await supabase.auth.signInWithPassword({email, password});
    return error?.message ?? null;
  },

  signUp: async (email, password, fullName) => {
    const {error} = await supabase.auth.signUp({
      email,
      password,
      options: {data: {full_name: fullName}},
    });
    return error?.message ?? null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({session: null});
  },
}));
