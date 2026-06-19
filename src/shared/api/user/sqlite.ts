import { getDb } from '@/shared/lib'
import type { UserSettings } from '@/entities/user'

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

export function getLocalSettings(userId: string): UserSettings | null {
  const db = getDb()
  try {
    const row = db.getFirstSync<Record<string, any>>(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId],
    )
    if (!row) return null
    return {
      userId: row.user_id,
      theme: row.theme,
      currency: row.currency,
      language: row.language,
      notifications: JSON.parse(row.notifications),
      security: JSON.parse(row.security),
      sync: JSON.parse(row.sync),
    }
  } catch {
    return null
  }
}

export function upsertLocalSettings(settings: UserSettings): void {
  const db = getDb()
  db.runSync(
    `INSERT OR REPLACE INTO user_settings
     (user_id, theme, currency, language, notifications, security, sync, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      settings.userId,
      settings.theme,
      settings.currency,
      settings.language,
      JSON.stringify(settings.notifications),
      JSON.stringify(settings.security),
      JSON.stringify(settings.sync),
    ],
  )
}

export function getDefaultSettings(): Omit<UserSettings, 'userId'> {
  return { ...DEFAULT_SETTINGS }
}
