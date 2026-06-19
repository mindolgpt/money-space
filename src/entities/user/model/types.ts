export type AuthUser = {
  id: string
  email: string
  name?: string
}

export type UserProfile = {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt?: string
  lastActiveAt?: string
}

export type NotificationSettings = {
  budgetAlert: boolean
  recurringReminder: boolean
  weeklySummary: boolean
  monthlyReport: boolean
}

export type SecuritySettings = {
  biometricEnabled: boolean
  autoLockTimeout: number
}

export type SyncSettings = {
  wifiOnly: boolean
  autoSyncInterval: number
}

export type UserSettings = {
  userId: string
  theme: 'light' | 'dark' | 'system'
  currency: string
  language: string
  notifications: NotificationSettings
  security: SecuritySettings
  sync: SyncSettings
}
