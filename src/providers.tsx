import './global.css'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Lock } from 'lucide-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-manager'
import {
  pushPendingChanges,
  subscribeToRealtime,
  onNetworkChange,
  setNetworkStatus,
} from '@/features/sync/sync-engine'
import { SYNC_INTERVAL_MS } from '@/shared/config'
import { ThemeProvider, useThemeStore } from '@/shared/lib/theme-provider'
import { colors } from '@/shared/lib/colors'
import { logger } from '@/shared/lib/logger'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

const origWarn = console.warn
console.warn = (msg, ...args) => {
  if (typeof msg === 'string' &&
    (msg.includes('expo-notifications:') ||
     msg.includes('expo-notifications functionality is not fully supported'))) {
    return
  }
  origWarn(msg, ...args)
}

logger.info('App initializing', { timestamp: new Date().toISOString() })

function ThemeInitializer({ children }: { children: ReactNode }) {
  const { mode, setTheme } = useThemeStore()

  useEffect(() => {
    setTheme(mode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

function AuthRouter({ children }: { children: ReactNode }) {
  const { restoreSession, initializeAuthListener, user, isLoading, needsBiometric, authenticateBiometric, signOut } =
    useAuthStore()
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )
  const [biometricPrompted, setBiometricPrompted] = useState(false)

  useEffect(() => {
    logger.debug('AuthRouter: restoring session')
    restoreSession()
    const unsubscribe = initializeAuthListener()
    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      logger.info('AuthRouter: user authenticated', { userId: user.id })
      const sub = subscribeToRealtime()
      pushPendingChanges()
      syncIntervalRef.current = setInterval(() => {
        pushPendingChanges()
      }, SYNC_INTERVAL_MS)
      return () => {
        sub?.unsubscribe()
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !needsBiometric) {
      if (user) {
        logger.debug('AuthRouter: navigating to tabs')
        router.replace({ pathname: '/(tabs)' } as any)
      } else {
        logger.debug('AuthRouter: navigating to login')
        router.replace({ pathname: '/auth/login' } as any)
      }
    }
  }, [user, isLoading, needsBiometric])

  useEffect(() => {
    if (needsBiometric && !biometricPrompted && user) {
      setBiometricPrompted(true)
      authenticateBiometric().then((success) => {
        if (success) {
          useAuthStore.setState({ needsBiometric: false })
        } else {
          signOut()
        }
      })
    }
  }, [needsBiometric, biometricPrompted, user, authenticateBiometric, signOut])

  if (needsBiometric) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-accent-green/20 items-center justify-center mb-6">
          <Lock size={40} color={colors.accentGreen} />
        </View>
        <Text className="text-xl font-semibold text-text-primary mb-2">
          생체 인증 필요
        </Text>
        <Text className="text-sm text-text-secondary mb-8 text-center px-8">
          계정 보안을 위해 생체 인증이 필요합니다
        </Text>
        <ActivityIndicator size="large" color={colors.accentGreen} />
        <TouchableOpacity
          className="mt-8 px-6 py-3 rounded-lg bg-accent-green"
          onPress={async () => {
            const success = await authenticateBiometric()
            if (success) {
              useAuthStore.setState({ needsBiometric: false })
            }
          }}
        >
          <Text className="text-white font-medium">인증 다시 시도</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return <>{children}</>
}

function NetworkMonitor({ children }: { children: ReactNode }) {
  useEffect(() => {
    setNetworkStatus(true)
    const unsubscribe = onNetworkChange(async (isOnline) => {
      logger.info('NetworkMonitor: network change', { isOnline })
      if (isOnline) {
        await pushPendingChanges()
      }
    })
    return unsubscribe
  }, [])

  return <>{children}</>
}

function NotificationsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (Constants.executionEnvironment === 'storeClient') {
      return
    }

    const setup = async () => {
      const notifications = await import('@/shared/lib/notifications')
      await notifications.setupNotificationChannels()
      const permission = await notifications.requestNotificationPermissions()
      logger.info('NotificationsProvider: permission status', { status: permission.status })

      if (permission.status === 'granted') {
        const token = await notifications.getNotificationToken()
        if (token) {
          logger.info('Push notification token obtained')
        }
      }
    }
    setup()

    let subscription: { remove: () => void } | null = null
    import('@/shared/lib/notifications').then((notifications) => {
      subscription = notifications.addNotificationResponseReceivedListener(notifications.handleNotificationResponse)
    })

    return () => {
      subscription?.remove()
    }
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeInitializer>
          <NotificationsProvider>
            <AuthRouter>
              <NetworkMonitor>{children}</NetworkMonitor>
            </AuthRouter>
          </NotificationsProvider>
        </ThemeInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
