import '../global.css'
import { router } from 'expo-router'
import { useEffect, useRef, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-manager'
import {
  pushPendingChanges,
  subscribeToRealtime,
} from '@/features/sync/sync-engine'
import { SYNC_INTERVAL_MS } from '@/shared/config'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  const { restoreSession, user, isLoading } = useAuthStore()
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )

  useEffect(() => {
    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      subscribeToRealtime()
      pushPendingChanges()
      syncIntervalRef.current = setInterval(() => {
        pushPendingChanges()
      }, SYNC_INTERVAL_MS)
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
    }
  }, [user])

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)')
      } else {
        router.replace('/auth/login')
      }
    }
  }, [user, isLoading])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
