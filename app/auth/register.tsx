import { RegisterForm , useAuthStore } from '@/features/auth/auth-manager'
import { router } from 'expo-router'

export default function RegisterScreen() {
  const { checkOnboardingStatus } = useAuthStore()

  const handleSuccess = async () => {
    await checkOnboardingStatus()
    router.replace({ pathname: '/onboarding' } as any)
  }

  return (
    <RegisterForm
      onSwitch={() =>
        router.replace({ pathname: '/auth/login' } as any)
      }
      onSuccess={handleSuccess}
    />
  )
}
