import { getItem, setItem, removeItem } from '@/shared/lib/storage'

export async function storeTokens(
  session: {
    access_token?: string
    refresh_token?: string
  } | null,
) {
  if (session?.access_token) {
    await setItem('access_token', session.access_token)
    if (session.refresh_token) {
      await setItem('refresh_token', session.refresh_token)
    }
  }
}

export async function getAccessToken(): Promise<string | null> {
  return getItem('access_token')
}

export async function clearTokens(): Promise<void> {
  await removeItem('access_token')
  await removeItem('refresh_token')
}

const ONBOARDING_KEY = 'has_completed_onboarding'

export async function getOnboardingStatus(): Promise<boolean> {
  const value = await getItem(ONBOARDING_KEY)
  return value === 'true'
}

export async function setOnboardingCompleted(): Promise<void> {
  await setItem(ONBOARDING_KEY, 'true')
}

export async function clearOnboardingStatus(): Promise<void> {
  await removeItem(ONBOARDING_KEY)
}
