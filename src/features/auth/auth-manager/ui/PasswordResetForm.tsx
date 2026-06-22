import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { createUserApi } from '@/entities/user'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function PasswordResetForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const authApi = createUserApi().remote

  const onEmailChange = (text: string) => {
    setEmail(text.trim())
    if (error) setError('')
  }

  const onResetPress = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요')
      return
    }

    if (!isValidEmail(email)) {
      setError('유효한 이메일을 입력해주세요')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authApi.resetPassword(email)
      setIsSuccess(true)
    } catch (e: any) {
      const message = e?.message ?? ''
      if (message.includes('User not found')) {
        setError('존재하지 않는 이메일입니다')
      } else {
        setError('요청 실패. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-bg-primary"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-accent-green/10 items-center justify-center mb-4">
              <Text className="text-3xl">✉️</Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-2">
              이메일 전송 완료
            </Text>
            <Text className="text-sm text-secondary text-center leading-5">
              {email}로{'\n'}비밀번호 재설정 링크를 보냈습니다.
            </Text>
          </View>
          <TouchableOpacity
            className="btn btn-primary py-4 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold text-base">
              로그인으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Title */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-accent-blue/10 items-center justify-center mb-4">
            <Text className="text-3xl">🔑</Text>
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2">
            비밀번호 찾기
          </Text>
          <Text className="text-sm text-secondary text-center leading-5">
            가입한 이메일 주소를 입력하면{'\n'}
            재설정 링크를 보내드립니다.
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View className="bg-accent-red/10 rounded-xl p-3 mb-4">
            <Text className="text-accent-red text-sm text-center">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="mb-6">
          <Text className="text-sm text-secondary mb-2">이메일</Text>
          <TextInput
            className={`input mb-6 ${error ? 'border-accent-red' : ''}`}
            placeholder="example@email.com"
            placeholderTextColor="#C7C7CC"
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={onResetPress}
          />

          <TouchableOpacity
            className={`btn py-4 flex-row justify-center items-center ${
              isLoading ? 'bg-accent-blue/60' : 'btn-primary'
            }`}
            onPress={onResetPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-base">
              {isLoading ? '전송 중...' : '재설정 링크 보내기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity
          className="items-center"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-accent-blue text-sm font-medium">
            로그인으로 돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
