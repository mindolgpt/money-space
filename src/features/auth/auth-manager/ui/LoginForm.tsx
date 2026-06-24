import { useState } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Wallet, Globe, Smartphone, Eye, EyeOff } from 'lucide-react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/features/auth/auth-manager/model/use-auth-store'
import { colors } from '@/shared/lib/colors'
import { Button, Input, Typography } from '@/shared/ui'

type FormErrors = {
  email?: string
  password?: string
  general?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuthStore()

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const onEmailChange = (text: string) => {
    setEmail(text.trim())
    if (text && !isValidEmail(text)) {
      setErrors((prev) => ({ ...prev, email: '유효한 이메일을 입력해주세요' }))
    } else {
      clearFieldError('email')
    }
  }

  const onPasswordChange = (text: string) => {
    setPassword(text)
    if (text) clearFieldError('password')
  }

  const onLoginPress = async () => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!isValidEmail(email)) {
      newErrors.email = '유효한 이메일을 입력해주세요'
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await signIn(email, password)
    } catch (e: any) {
      const message = e?.message ?? ''
      if (
        message.includes('Invalid login credentials') ||
        message.includes('invalid_credentials')
      ) {
        setErrors({
          password: '이메일 또는 비밀번호가 올바르지 않습니다',
        })
        setPassword('')
      } else if (message.includes('Email not confirmed')) {
        setErrors({ general: '이메일 인증을 완료해주세요' })
      } else {
        setErrors({ general: '로그인에 실패했습니다. 다시 시도해주세요.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo/Title */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-2xl bg-accent-green items-center justify-center mb-5">
            <Wallet size={36} color={colors.white} />
          </View>
          <Typography variant="headline-md" weight="bold" color="primary" className="tracking-tight">
            Money Space
          </Typography>
          <Typography variant="label-sm" color="secondary" className="mt-1.5">
            가계부를 함께 관리하세요
          </Typography>
        </View>

        {/* General Error */}
        {errors.general ? (
          <View className="bg-semantic-expense/10 rounded-xl p-3 mb-4">
            <Typography variant="label-sm" color="expense" weight="medium" className="text-center">
              {errors.general}
            </Typography>
          </View>
        ) : null}

        {/* Form */}
        <View className="mb-6">
          <Input
            variant="box"
            label="이메일"
            placeholder="example@email.com"
            value={email}
            onChangeText={onEmailChange}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            returnKeyType="next"
          />

          <Input
            variant="box"
            label="비밀번호"
            placeholder="비밀번호"
            value={password}
            onChangeText={onPasswordChange}
            error={errors.password}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={onLoginPress}
            rightElement={
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textTertiary} />
                ) : (
                  <Eye size={20} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
          />

          {/* Forgot Password */}
          <TouchableOpacity
            className="items-end mb-6"
            onPress={() => router.push('/auth/reset-password' as any)}
          >
            <Typography variant="label-sm" color="accent" weight="semibold">
              비밀번호 찾기
            </Typography>
          </TouchableOpacity>

          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={onLoginPress}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* Social Login */}
          <View className="mt-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Typography variant="label-sm" color="tertiary" weight="medium" className="mx-3">
                또는
              </Typography>
              <View className="flex-1 h-px bg-border" />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-lg bg-bg-tertiary mb-3 opacity-50"
              disabled
            >
              <Globe size={20} color={colors.textTertiary} />
              <Typography variant="label-sm" color="secondary" weight="medium" className="ml-2">
                Google로 계속하기 (준비 중)
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-lg bg-bg-tertiary opacity-50"
              disabled
            >
              <Smartphone size={20} color={colors.textTertiary} />
              <Typography variant="label-sm" color="secondary" weight="medium" className="ml-2">
                Apple로 계속하기 (준비 중)
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Link */}
        <TouchableOpacity
          className="items-center"
          onPress={onSwitch}
          disabled={isLoading}
        >
          <Typography variant="label-sm" color="secondary" weight="medium">
            계정이 없으신가요?{' '}
            <Typography variant="label-sm" color="accent" weight="semibold">회원가입</Typography>
          </Typography>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
