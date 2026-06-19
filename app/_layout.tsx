import { Providers } from '@/providers'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useThemeStore } from '@/shared/lib/theme-provider'
import { ErrorBoundary } from '@/shared/ui'
import { logger } from '@/shared/lib/logger'

function RootLayoutContent() {
  const { isDark } = useThemeStore()

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}

function handleError(error: Error, errorInfo: React.ErrorInfo) {
  logger.error('Unhandled error in RootLayout', {
    errorMessage: error.message,
    componentStack: errorInfo.componentStack,
  })
}

export default function RootLayout() {
  return (
    <ErrorBoundary onError={handleError}>
      <Providers>
        <RootLayoutContent />
      </Providers>
    </ErrorBoundary>
  )
}