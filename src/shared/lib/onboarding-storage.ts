import * as SecureStore from 'expo-secure-store'

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