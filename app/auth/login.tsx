import { LoginForm } from '@/features/auth/auth-manager'
import { router } from 'expo-router'

export default function LoginScreen() {
  return <LoginForm onSwitch={() => router.replace('/auth/register')} />
}
