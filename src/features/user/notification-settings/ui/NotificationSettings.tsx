import { View, Text } from 'react-native'
import { useNotificationSettings } from '@/features/user/notification-settings/model/use-notification-settings'
import type { NotificationKey } from '@/features/user/notification-settings/model/use-notification-settings'
import { Toggle } from '@/shared/ui'

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
  const { settings, onToggleChange } = useNotificationSettings()

  if (!settings) return null

  return (
    <View>
      <Text className="text-headline-md font-semibold text-text-primary mb-4">
        알림 설정
      </Text>

      <View className="card p-4 mb-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <View
            key={item.key}
            className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0"
          >
            <View className="flex-1 mr-4">
              <Text className="text-body-md font-medium text-text-primary">
                {item.label}
              </Text>
              <Text className="text-label-sm text-text-tertiary mt-0.5">
                {item.description}
              </Text>
            </View>
            <Toggle
              value={settings.notifications[item.key]}
              onToggle={() => onToggleChange(item.key, !settings.notifications[item.key])}
            />
          </View>
        ))}
      </View>
    </View>
  )
}
