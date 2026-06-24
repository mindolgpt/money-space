import { getItem, setItem, removeItem } from '@/shared/lib/storage'

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
