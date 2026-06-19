import * as Notifications from 'expo-notifications'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { logger } from '@/shared/lib/logger'

export type NotificationChannel = 'budget-alert' | 'recurring-reminder' | 'weekly-summary' | 'monthly-report' | 'family-invite'

export type NotificationPayload = {
  title: string
  body: string
  data?: Record<string, any>
}

export const NOTIFICATION_CHANNELS: Record<NotificationChannel, { title: string; description: string }> = {
  'budget-alert': {
    title: '예산 경고',
    description: '예산 초과 시 알림',
  },
  'recurring-reminder': {
    title: '반복 항목 리마인더',
    description: '정기적인 거래 알림',
  },
  'weekly-summary': {
    title: '주간 요약',
    description: '매주 일요일 요약 리포트',
  },
  'monthly-report': {
    title: '월간 보고서',
    description: '매월 1일 월간 보고서',
  },
  'family-invite': {
    title: '가족 초대',
    description: '가족 초대 알림',
  },
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    for (const [channelId, config] of Object.entries(NOTIFICATION_CHANNELS)) {
      await Notifications.setNotificationChannelAsync(channelId, {
        name: config.title,
        description: config.description,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0A84FF',
      })
    }
    logger.info('Notification channels setup complete')
  }
}

export async function requestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  const { status } = await Notifications.getPermissionsAsync()
  if (status === 'granted') {
    logger.info('Notification permissions already granted')
    return { status } as Notifications.NotificationPermissionsStatus
  }

  const result = await Notifications.requestPermissionsAsync()
  logger.info('Notification permissions requested', { status: result.status })
  return result
}

export async function getNotificationToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync()
    logger.info('Notification token obtained', { truncated: tokenData.data.substring(0, 20) })
    return tokenData.data
  } catch (error) {
    logger.warn('Failed to get notification token', { error })
    return null
  }
}

export async function scheduleLocalNotification(
  channelId: NotificationChannel,
  notification: NotificationPayload,
  trigger: Notifications.NotificationTriggerInput | null = null,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
    },
    trigger,
  })
  logger.info('Local notification scheduled', { channelId, id })
  return id
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id)
  logger.info('Notification cancelled', { id })
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  logger.info('All notifications cancelled')
}

export async function sendImmediateNotification(notification: NotificationPayload): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
    },
    trigger: null,
  })
}

export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const { notification, actionIdentifier } = response

  if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    const data = notification.request.content.data

    if (data?.type === 'family-invite') {
      const inviteCode = data.inviteCode
      if (inviteCode) {
        Linking.openURL(`money-space://invite/${inviteCode}`)
      }
    } else if (data?.type === 'budget-alert') {
      Linking.openURL('money-space://settings?section=budget')
    }
  }

  logger.debug('Notification response handled', {
    actionIdentifier,
    notificationId: notification.request.identifier,
  })
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback)
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}