import { create } from 'zustand'
import {
  createUserApi,
  storeTokens,
  getAccessToken,
  clearTokens,
} from '@/entities/user'
import type { AuthUser } from '@/entities/user'

const authApi = createUserApi().remote

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  signUp: async (email, password, name) => {
    const result = await authApi.signUp(email, password, name)
    if (result.session) await storeTokens(result.session)
    set({
      user: result.user
        ? { id: result.user.id, email: result.user.email, name }
        : null,
    })
  },

  signIn: async (email, password) => {
    const result = await authApi.signIn(email, password)
    await storeTokens(result.session)
    set({
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name,
          }
        : null,
    })
  },

  signOut: async () => {
    await authApi.signOut()
    await clearTokens()
    set({ user: null })
  },

  restoreSession: async () => {
    const token = await getAccessToken()
    if (token) {
      const result = await authApi.getUser(token)
      if (result.user) {
        set({
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name,
          },
          isLoading: false,
        })
        return
      }
    }
    set({ isLoading: false })
  },
}))
