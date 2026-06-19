import * as SecureStore from 'expo-secure-store'

export async function storeTokens(
  session: {
    access_token?: string
    refresh_token?: string
  } | null,
) {
  if (session?.access_token) {
    await SecureStore.setItemAsync('access_token', session.access_token)
    if (session.refresh_token) {
      await SecureStore.setItemAsync('refresh_token', session.refresh_token)
    }
  }
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync('access_token')
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('access_token')
  await SecureStore.deleteItemAsync('refresh_token')
}

const ONBOARDING_KEY = 'has_completed_onboarding'

export async function getOnboardingStatus(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY)
  return value === 'true'
}

export async function setOnboardingCompleted(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true')
}

export async function clearOnboardingStatus(): Promise<void> {
  await SecureStore.deleteItemAsync(ONBOARDING_KEY)
}
