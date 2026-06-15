import { supabase } from "../../shared/api/supabase";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

async function storeTokens(session: any) {
  if (session?.access_token) {
    await SecureStore.setItemAsync("access_token", session.access_token);
    await SecureStore.setItemAsync("refresh_token", session.refresh_token);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    if (error) throw error;
    if (data.session) await storeTokens(data.session);
    set({
      user: data.user
        ? { id: data.user.id, email: data.user.email!, name }
        : null,
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await storeTokens(data.session);
    set({
      user: data.user
        ? { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name }
        : null,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ user: null });
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          },
          isLoading: false,
        });
        return;
      }
    }
    set({ isLoading: false });
  },
}));
