import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Wallet, Eye, EyeOff, Check } from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/auth-manager/model/use-auth-store'
import { colors } from '@/shared/lib/colors'
import { Button } from '@/shared/ui'

type FormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

type PasswordStrength = {
  score: number
  label: string
  color: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: '취약', color: 'text-semantic-expense' }
  if (score <= 3) return { score, label: '보통', color: 'text-accent-yellow' }
  if (score <= 4) return { score, label: '강함', color: 'text-semantic-income' }
  return { score, label: '매우 강함', color: 'text-semantic-income' }
}

export function RegisterForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void
  onSuccess?: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isTermsAgreed, setIsTermsAgreed] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuthStore()

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  const passwordStrength = password ? evaluatePasswordStrength(password) : null

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const onNameChange = (text: string) => {
    if (text.length > 30) return
    setName(text)
    if (text.trim()) clearFieldError('name')
  }

  const onEmailChange = (text: string) => {
    const trimmed = text.trim()
    setEmail(trimmed)
    if (trimmed && !isValidEmail(trimmed)) {
      setErrors((prev) => ({ ...prev, email: '유효한 이메일을 입력해주세요' }))
    } else {
      clearFieldError('email')
    }
  }

  const onPasswordChange = (text: string) => {
    setPassword(text)
    if (text && evaluatePasswordStrength(text).score < 2) {
      setErrors((prev) => ({
        ...prev,
        password: '8자 이상, 영문/숫자/특수문자 포함',
      }))
    } else {
      clearFieldError('password')
    }
    if (confirmPassword && text !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '비밀번호가 일치하지 않습니다',
      }))
    } else {
      clearFieldError('confirmPassword')
    }
  }

  const onConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text)
    if (text && text !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '비밀번호가 일치하지 않습니다',
      }))
    } else {
      clearFieldError('confirmPassword')
    }
  }

  const onSignUpPress = async () => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!isValidEmail(email)) {
      newErrors.email = '유효한 이메일을 입력해주세요'
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (evaluatePasswordStrength(password).score < 2) {
      newErrors.password = '8자 이상, 영문/숫자/특수문자 포함'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    if (!isTermsAgreed) {
      newErrors.general = '이용약관에 동의해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await signUp(email, password, name.trim())
      onSuccess?.()
    } catch (e: any) {
      const message = e?.message ?? ''
      console.log('SignUp error:', e)
      if (message.includes('User already registered')) {
        setErrors({ email: '이미 가입된 이메일입니다' })
      } else {
        setErrors({ general: `회원가입에 실패했습니다: ${message}` })
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 pt-16">
          {/* Logo/Title */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-accent-green items-center justify-center mb-4">
              <Wallet size={36} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold text-text-primary tracking-tight">회원가입</Text>
            <Text className="text-sm text-text-secondary mt-1.5">
              Money Space 시작하기
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
            {/* Name */}
            <Text className="text-sm text-text-secondary mb-2 font-medium">이름</Text>
            <TextInput
              className={`w-full bg-bg-tertiary rounded-xl px-4 py-4 text-base text-text-primary mb-1 ${
                errors.name ? 'border border-semantic-expense' : ''
              }`}
              placeholder="김철수"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={onNameChange}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {errors.name ? (
              <Text className="text-semantic-expense text-xs mb-3 ml-1 font-medium">{errors.name}</Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Email */}
            <Text className="text-sm text-text-secondary mb-2 font-medium">이메일</Text>
            <TextInput
              ref={emailRef}
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
              <Text className="text-semantic-expense text-xs mb-3 ml-1 font-medium">{errors.email}</Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Password */}
            <Text className="text-sm text-text-secondary mb-2 font-medium">비밀번호</Text>
            <View
              className={`flex-row items-center w-full bg-bg-tertiary rounded-xl px-4 py-4 mb-1 ${
                errors.password ? 'border border-semantic-expense' : ''
              }`}
            >
              <TextInput
                ref={passwordRef}
                className="flex-1 text-base text-text-primary"
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={onPasswordChange}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

            {/* Password Strength */}
            {passwordStrength && password.length > 0 ? (
              <View className="flex-row items-center mb-1 ml-1">
                <View className="flex-row flex-1 gap-1 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      className={`flex-1 h-1 rounded-full ${
                        i <= passwordStrength.score
                          ? passwordStrength.color.replace('text-', 'bg-')
                          : 'bg-bg-tertiary'
                      }`}
                    />
                  ))}
                </View>
                <Text className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </Text>
              </View>
            ) : null}

            {errors.password ? (
              <Text className="text-semantic-expense text-xs mb-3 ml-1 font-medium">{errors.password}</Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Confirm Password */}
            <Text className="text-sm text-text-secondary mb-2 font-medium">비밀번호 확인</Text>
            <View
              className={`flex-row items-center w-full bg-bg-tertiary rounded-xl px-4 py-4 mb-1 ${
                errors.confirmPassword ? 'border border-semantic-expense' : ''
              }`}
            >
              <TextInput
                ref={confirmPasswordRef}
                className="flex-1 text-base text-text-primary"
                placeholder="비밀번호 다시 입력"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={onSignUpPress}
              />
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textTertiary} />
                ) : (
                  <Eye size={20} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-semantic-expense text-xs mb-4 ml-1 font-medium">{errors.confirmPassword}</Text>
            ) : (
              <View className="mb-4" />
            )}

            {/* Terms Agreement */}
            <TouchableOpacity
              className="flex-row items-center mb-6"
              onPress={() => setIsTermsAgreed((prev) => !prev)}
              disabled={isLoading}
            >
              <View
                className={`w-5 h-5 rounded-md border-2 items-center justify-center mr-3 ${
                  isTermsAgreed
                    ? 'bg-accent-green border-accent-green'
                    : 'border-border'
                }`}
              >
                {isTermsAgreed ? <Check size={12} color={colors.white} /> : null}
              </View>
              <Text className="text-sm text-text-secondary flex-1 leading-5">
                이용약관 및{' '}
                <Text className="text-accent-green font-semibold">개인정보 처리방침</Text>에
                동의합니다
              </Text>
            </TouchableOpacity>

            <Button
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>
          </View>

          {/* Login Link */}
          <TouchableOpacity
            className="items-center"
            onPress={onSwitch}
            disabled={isLoading}
          >
            <Text className="text-text-secondary font-medium">
              이미 계정이 있으신가요?{' '}
              <Text className="text-accent-green font-semibold">로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
