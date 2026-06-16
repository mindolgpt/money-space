import Constants from 'expo-constants'

const url = Constants.expoConfig?.extra?.supabaseUrl
const key = Constants.expoConfig?.extra?.supabaseAnonKey

if (!url) throw new Error('Missing SUPABASE_URL in app.json extra config')
if (!key) throw new Error('Missing SUPABASE_ANON_KEY in app.json extra config')

export const SUPABASE_URL = url as string
export const SUPABASE_ANON_KEY = key as string
