import { supabase } from '@/shared/api/supabase'
import type { UserProfile, UserSettings } from '@/entities/user'

const DEFAULT_SETTINGS: Omit<UserSettings, 'userId'> = {
  theme: 'light',
  currency: 'KRW',
  language: 'ko',
  notifications: {
    budgetAlert: true,
    recurringReminder: true,
    weeklySummary: false,
    monthlyReport: true,
  },
  security: {
    biometricEnabled: false,
    autoLockTimeout: 5,
  },
  sync: {
    wifiOnly: false,
    autoSyncInterval: 30,
  },
}

export function createUserApi() {
  return {
    getProfile: async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        createdAt: data.created_at,
        lastActiveAt: data.updated_at,
      }
    },

    updateProfile: async (
      userId: string,
      updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>,
    ): Promise<void> => {
      const payload: Record<string, any> = {}
      if (updates.name !== undefined) payload.name = updates.name
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl
      payload.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', userId)
      if (error) throw error
    },

    getSettings: async (
      userId: string,
    ): Promise<UserSettings> => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { userId, ...DEFAULT_SETTINGS }
        }
        return { userId, ...DEFAULT_SETTINGS }
      }

      return {
        userId: data.user_id,
        theme: data.theme ?? DEFAULT_SETTINGS.theme,
        currency: data.currency ?? DEFAULT_SETTINGS.currency,
        language: data.language ?? DEFAULT_SETTINGS.language,
        notifications: {
          budgetAlert: data.notifications?.budgetAlert ?? DEFAULT_SETTINGS.notifications.budgetAlert,
          recurringReminder: data.notifications?.recurringReminder ?? DEFAULT_SETTINGS.notifications.recurringReminder,
          weeklySummary: data.notifications?.weeklySummary ?? DEFAULT_SETTINGS.notifications.weeklySummary,
          monthlyReport: data.notifications?.monthlyReport ?? DEFAULT_SETTINGS.notifications.monthlyReport,
        },
        security: {
          biometricEnabled: data.security?.biometricEnabled ?? DEFAULT_SETTINGS.security.biometricEnabled,
          autoLockTimeout: data.security?.autoLockTimeout ?? DEFAULT_SETTINGS.security.autoLockTimeout,
        },
        sync: {
          wifiOnly: data.sync?.wifiOnly ?? DEFAULT_SETTINGS.sync.wifiOnly,
          autoSyncInterval: data.sync?.autoSyncInterval ?? DEFAULT_SETTINGS.sync.autoSyncInterval,
        },
      }
    },

    updateSettings: async (
      userId: string,
      updates: Partial<Omit<UserSettings, 'userId'>>,
    ): Promise<void> => {
      const existing = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      const current = existing.data ?? {}

      const payload = {
        user_id: userId,
        theme: updates.theme ?? current.theme ?? DEFAULT_SETTINGS.theme,
        currency: updates.currency ?? current.currency ?? DEFAULT_SETTINGS.currency,
        language: updates.language ?? current.language ?? DEFAULT_SETTINGS.language,
        notifications: updates.notifications ?? current.notifications ?? DEFAULT_SETTINGS.notifications,
        security: updates.security ?? current.security ?? DEFAULT_SETTINGS.security,
        sync: updates.sync ?? current.sync ?? DEFAULT_SETTINGS.sync,
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' })
      if (error) throw error
    },

    deleteAccount: async (userId: string): Promise<void> => {
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: userId,
      })
      if (error) throw error
    },

    getDefaultSettings: () => ({ ...DEFAULT_SETTINGS }),
  }
}
