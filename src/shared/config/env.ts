const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL in .env')
if (!key) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env')

export const SUPABASE_URL = url
export const SUPABASE_ANON_KEY = key