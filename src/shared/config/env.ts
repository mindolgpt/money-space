import Constants from "expo-constants";

export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl ?? "";
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey ?? "";
