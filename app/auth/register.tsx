import { RegisterForm } from '@/features/auth/auth-manager'
import { router } from 'expo-router'

export default function RegisterScreen() {
  return <RegisterForm onSwitch={() => router.replace('/auth/login')} />
}
