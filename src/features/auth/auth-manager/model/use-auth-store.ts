import { create } from 'zustand'
import * as LocalAuthentication from 'expo-local-authentication'
import { logger } from '@/shared/lib/logger'
import {
  createUserApi,
  storeTokens,
  getAccessToken,
  clearTokens,
  getOnboardingStatus,
  setOnboardingCompleted,
  getLocalSettings,
  upsertLocalSettings,
  getDefaultSettings,
} from '@/entities/user'
import type { AuthUser } from '@/entities/user'

const authApi = createUserApi().remote

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isSigningOut: boolean
  hasCompletedOnboarding: boolean
  biometricAvailable: boolean
  biometricEnabled: boolean
  needsBiometric: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
  initializeAuthListener: () => () => void
  setUser: (user: AuthUser | null) => void
  checkOnboardingStatus: () => Promise<void>
  completeOnboarding: () => Promise<void>
  checkBiometricAvailability: () => Promise<boolean>
  authenticateBiometric: () => Promise<boolean>
  enableBiometric: (userId: string) => Promise<void>
  disableBiometric: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSigningOut: false,
  hasCompletedOnboarding: false,
  biometricAvailable: false,
  biometricEnabled: false,
  needsBiometric: false,

  checkBiometricAvailability: async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    const available = compatible && enrolled
    set({ biometricAvailable: available })
    return available
  },

  authenticateBiometric: async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Money Space 잠금 해제',
      fallbackLabel: '비밀번호 사용',
      cancelLabel: '취소',
    })
    return result.success
  },

  enableBiometric: async (userId) => {
    const settings = getLocalSettings(userId) ?? {
      userId,
      ...getDefaultSettings(),
    }
    settings.security.biometricEnabled = true
    upsertLocalSettings(settings)
    set({ biometricEnabled: true })
  },

  disableBiometric: async (userId) => {
    const settings = getLocalSettings(userId)
    if (settings) {
      settings.security.biometricEnabled = false
      upsertLocalSettings(settings)
    }
    set({ biometricEnabled: false })
  },

  signUp: async (email, password, name) => {
    const result = await authApi.signUp(email, password, name)
    if (result.session) await storeTokens(result.session)
    const user = result.user
      ? { id: result.user.id, email: result.user.email, name }
      : null
    set({ user, isAuthenticated: !!user })
  },

  signIn: async (email, password) => {
    const result = await authApi.signIn(email, password)
    await storeTokens(result.session)
    const user = result.user
      ? {
          id: result.user.id,
          email: result.user.email,
          name: result.user.user_metadata?.name,
        }
      : null
    set({ user, isAuthenticated: !!user })
  },

  signOut: async () => {
    set({ isSigningOut: true })
    try {
      await authApi.signOut()
      await clearTokens()
      set({ user: null, isAuthenticated: false, isSigningOut: false })
    } catch {
      set({ isSigningOut: false })
    }
  },

  restoreSession: async () => {
    const token = await getAccessToken()
    if (token) {
      const result = await authApi.getUser(token)
      if (result.user) {
        const user = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.user_metadata?.name,
        }
        set({ user, isAuthenticated: true })

        const settings = getLocalSettings(user.id)
        const biometricActive = settings?.security?.biometricEnabled ?? false
        const compatible = await LocalAuthentication.hasHardwareAsync()
        const enrolled = await LocalAuthentication.isEnrolledAsync()

        if (biometricActive && compatible && enrolled) {
          set({ biometricAvailable: true, biometricEnabled: true, needsBiometric: true, isLoading: false })
          return
        }

        set({ isLoading: false })
        await get().checkOnboardingStatus()
        return
      }
    }
    set({ isLoading: false })
  },

  initializeAuthListener: () => {
    const { unsubscribe } = authApi.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const result = await authApi.getUser(session.access_token)
          if (result.user) {
            const user = {
              id: result.user.id,
              email: result.user.email,
              name: result.user.user_metadata?.name,
            }
            set({ user, isAuthenticated: true })
          }
          await storeTokens(session)
        } else if (event === 'SIGNED_OUT') {
          const wasAuthenticated = get().isAuthenticated
          set({ user: null, isAuthenticated: false, needsBiometric: false })
          await clearTokens()
          if (wasAuthenticated) {
            logger.warn('Session expired, user signed out')
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await storeTokens(session)
        }
      },
    )
    return unsubscribe
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  checkOnboardingStatus: async () => {
    const completed = await getOnboardingStatus()
    set({ hasCompletedOnboarding: completed })
  },

  completeOnboarding: async () => {
    await setOnboardingCompleted()
    set({ hasCompletedOnboarding: true })
  },
}))
