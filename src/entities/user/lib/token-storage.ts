import * as SecureStore from 'expo-secure-store'

export async function storeTokens(
  session: {
    access_token?: string
    refresh_token?: string
  } | null,
) {
  if (session?.access_token) {
    await SecureStore.setItemAsync('access_token', session.access_token)
    await SecureStore.setItemAsync('refresh_token', session.refresh_token)
  }
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync('access_token')
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('access_token')
  await SecureStore.deleteItemAsync('refresh_token')
}
