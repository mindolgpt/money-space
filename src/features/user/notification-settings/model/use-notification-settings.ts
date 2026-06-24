import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserSettings, useUpdateSettings } from '@/entities/user'

export type NotificationKey = 'budgetAlert' | 'recurringReminder' | 'weeklySummary' | 'monthlyReport'

export function useNotificationSettings() {
  const { user } = useAuthStore()
  const { data: settings } = useUserSettings(user?.id)
  const { mutateAsync: updateSettings } = useUpdateSettings()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const onToggleChange = (key: NotificationKey, value: boolean) => {
    if (!user || !settings) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        await updateSettings({
          userId: user.id,
          updates: {
            notifications: {
              ...settings.notifications,
              [key]: value,
            },
          },
        })
      } catch {
        // handled by query client -> rollback
      }
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    settings,
    onToggleChange,
  }
}
