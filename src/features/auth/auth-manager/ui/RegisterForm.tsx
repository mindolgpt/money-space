import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager/model/use-auth-store'

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

  if (score <= 1) return { score, label: '취약', color: 'text-accent-red' }
  if (score <= 3) return { score, label: '보통', color: 'text-accent-yellow' }
  if (score <= 4) return { score, label: '강함', color: 'text-accent-green' }
  return { score, label: '매우 강함', color: 'text-accent-green' }
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
      className="flex-1 bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 pt-20">
          {/* Logo/Title */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-accent-blue items-center justify-center mb-4">
              <Text className="text-3xl">💰</Text>
            </View>
            <Text className="text-2xl font-bold text-primary">회원가입</Text>
            <Text className="text-sm text-secondary mt-1">
              Money Space 시작하기
            </Text>
          </View>

          {/* General Error */}
          {errors.general ? (
            <View className="bg-accent-red/10 rounded-xl p-3 mb-4">
              <Text className="text-accent-red text-sm text-center">
                {errors.general}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="mb-6">
            {/* Name */}
            <Text className="text-sm text-secondary mb-2">이름</Text>
            <TextInput
              className={`input mb-1 ${errors.name ? 'border-accent-red' : ''}`}
              placeholder="김철수"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={onNameChange}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {errors.name ? (
              <Text className="text-accent-red text-xs mb-3 ml-1">
                {errors.name}
              </Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Email */}
            <Text className="text-sm text-secondary mb-2">이메일</Text>
            <TextInput
              ref={emailRef}
              className={`input mb-1 ${errors.email ? 'border-accent-red' : ''}`}
              placeholder="example@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={onEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {errors.email ? (
              <Text className="text-accent-red text-xs mb-3 ml-1">
                {errors.email}
              </Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Password */}
            <Text className="text-sm text-secondary mb-2">비밀번호</Text>
            <View
              className={`flex-row items-center input mb-1 ${
                errors.password ? 'border-accent-red' : ''
              }`}
            >
              <TextInput
                ref={passwordRef}
                className="flex-1 text-base text-primary"
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor="#9CA3AF"
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
                <Text className="text-tertiary">
                  {showPassword ? '🙈' : '👁'}
                </Text>
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
                <Text
                  className={`text-xs ${passwordStrength.color}`}
                >
                  {passwordStrength.label}
                </Text>
              </View>
            ) : null}

            {errors.password ? (
              <Text className="text-accent-red text-xs mb-3 ml-1">
                {errors.password}
              </Text>
            ) : (
              <View className="mb-3" />
            )}

            {/* Confirm Password */}
            <Text className="text-sm text-secondary mb-2">비밀번호 확인</Text>
            <View
              className={`flex-row items-center input mb-1 ${
                errors.confirmPassword ? 'border-accent-red' : ''
              }`}
            >
              <TextInput
                ref={confirmPasswordRef}
                className="flex-1 text-base text-primary"
                placeholder="비밀번호 다시 입력"
                placeholderTextColor="#9CA3AF"
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
                <Text className="text-tertiary">
                  {showConfirmPassword ? '🙈' : '👁'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-accent-red text-xs mb-4 ml-1">
                {errors.confirmPassword}
              </Text>
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
                    ? 'bg-accent-blue border-accent-blue'
                    : 'border-border'
                }`}
              >
                {isTermsAgreed ? (
                  <Text className="text-white text-xs">✓</Text>
                ) : null}
              </View>
              <Text className="text-sm text-secondary flex-1">
                이용약관 및{' '}
                <Text className="text-accent-blue">개인정보 처리방침</Text>에
                동의합니다
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`btn py-4 flex-row justify-center items-center ${
                isLoading ? 'bg-accent-blue/60' : 'btn-primary'
              }`}
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" className="mr-2" />
              ) : null}
              <Text className="text-white font-semibold text-base">
                {isLoading ? '처리 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <TouchableOpacity
            className="items-center"
            onPress={onSwitch}
            disabled={isLoading}
          >
            <Text className="text-secondary">
              이미 계정이 있으신가요?{' '}
              <Text className="text-accent-blue font-medium">로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
