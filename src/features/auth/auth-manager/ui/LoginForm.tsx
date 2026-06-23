import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Globe, Smartphone, Wallet, Eye, EyeOff } from 'lucide-react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/features/auth/auth-manager/model/use-auth-store'
import { colors } from '@/shared/lib/colors'
import { Button } from '@/shared/ui'

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
  const passwordRef = useRef<TextInput>(null)

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
      if (newErrors.email) return
      passwordRef.current?.focus()
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
        passwordRef.current?.focus()
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
          <Text className="text-3xl font-bold text-text-primary tracking-tight">Money Space</Text>
          <Text className="text-sm text-text-secondary mt-1.5">
            가계부를 함께 관리하세요
          </Text>
        </View>

        {/* General Error */}
        {errors.general ? (
          <View className="bg-semantic-expense/10 rounded-xl p-3 mb-4">
            <Text className="text-semantic-expense text-sm text-center font-medium">
              {errors.general}
            </Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="mb-6">
          <Text className="text-sm text-text-secondary mb-2 font-medium">이메일</Text>
          <TextInput
            className={`w-full bg-bg-tertiary rounded-xl px-4 py-4 text-base text-text-primary mb-1 ${
              errors.email ? 'border border-semantic-expense' : ''
            }`}
            placeholder="example@email.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {errors.email ? (
            <Text className="text-semantic-expense text-xs mb-3 ml-1 font-medium">
              {errors.email}
            </Text>
          ) : (
            <View className="mb-3" />
          )}

          <Text className="text-sm text-text-secondary mb-2 font-medium">비밀번호</Text>
          <View
            className={`flex-row items-center w-full bg-bg-tertiary rounded-xl px-4 py-4 mb-1 ${
              errors.password ? 'border border-semantic-expense' : ''
            }`}
          >
            <TextInput
              ref={passwordRef}
              className="flex-1 text-base text-text-primary"
              placeholder="비밀번호"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={onLoginPress}
            />
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
          </View>
          {errors.password ? (
            <Text className="text-semantic-expense text-xs mb-3 ml-1 font-medium">
              {errors.password}
            </Text>
          ) : (
            <View className="mb-3" />
          )}

          {/* Forgot Password */}
          <TouchableOpacity
            className="items-end mb-6"
            onPress={() => router.push('/auth/reset-password' as any)}
          >
            <Text className="text-accent-green text-sm font-semibold">비밀번호 찾기</Text>
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
              <Text className="text-xs text-text-tertiary mx-3 font-medium">또는</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-lg bg-bg-tertiary mb-3 opacity-50"
              disabled
            >
              <Globe size={20} color={colors.textTertiary} />
              <Text className="text-sm font-medium text-text-secondary ml-2">Google로 계속하기 (준비 중)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-lg bg-bg-tertiary opacity-50"
              disabled
            >
              <Smartphone size={20} color={colors.textTertiary} />
              <Text className="text-sm font-medium text-text-secondary ml-2">Apple로 계속하기 (준비 중)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Link */}
        <TouchableOpacity
          className="items-center"
          onPress={onSwitch}
          disabled={isLoading}
        >
          <Text className="text-text-secondary font-medium">
            계정이 없으신가요?{' '}
            <Text className="text-accent-green font-semibold">회원가입</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
