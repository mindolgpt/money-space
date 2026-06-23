import { useEffect, useRef } from 'react'
import { View, Text, Switch } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserSettings, useUpdateSettings } from '@/entities/user'

type NotificationKey =
  | 'budgetAlert'
  | 'recurringReminder'
  | 'weeklySummary'
  | 'monthlyReport'

const NOTIFICATION_ITEMS: {
  key: NotificationKey
  label: string
  description: string
}[] = [
  {
    key: 'budgetAlert',
    label: '예산 경고',
    description: '예산 초과 시 알림',
  },
  {
    key: 'recurringReminder',
    label: '반복 항목 리마인더',
    description: '정기적인 거래 알림',
  },
  {
    key: 'weeklySummary',
    label: '주간 요약',
    description: '매주 일요일 요약 리포트',
  },
  {
    key: 'monthlyReport',
    label: '월간 보고서',
    description: '매월 1일 월간 보고서',
  },
]

export function NotificationSettings() {
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
        // error handled by query client -> rollback
      }
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!settings) return null

  return (
    <View>
      <Text className="text-base font-semibold text-text-primary mb-4">
        알림 설정
      </Text>

      <View className="card p-4 mb-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <View
            key={item.key}
            className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0"
          >
            <View className="flex-1 mr-4">
              <Text className="text-sm font-medium text-text-primary">
                {item.label}
              </Text>
              <Text className="text-xs text-text-tertiary mt-0.5">
                {item.description}
              </Text>
            </View>
            <Switch
              value={settings.notifications[item.key]}
              onValueChange={(v) => onToggleChange(item.key, v)}
              trackColor={{
                false: '#edeeef',
                true: '#10b981',
              }}
              thumbColor="white"
            />
          </View>
        ))}
      </View>
    </View>
  )
}
