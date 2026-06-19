import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useThemeStore } from '@/shared/lib/theme-provider'

export default function AuthLayout() {
  const { isDark } = useThemeStore()

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}