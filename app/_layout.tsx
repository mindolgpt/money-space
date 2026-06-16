import { Providers } from '@/app/providers'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </Providers>
  )
}
