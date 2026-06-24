import { useState } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { createUserApi } from '@/entities/user'
import { Button, Input, Typography } from '@/shared/ui'

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
              <Typography variant="headline-md">✉️</Typography>
            </View>
            <Typography variant="headline-md" weight="bold" color="primary" className="mb-2">
              이메일 전송 완료
            </Typography>
            <Typography variant="label-sm" color="secondary" className="text-center leading-5">
              {email}로{'\n'}비밀번호 재설정 링크를 보냈습니다.
            </Typography>
          </View>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.back()}
          >
            로그인으로 돌아가기
          </Button>
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
          <View className="w-20 h-20 rounded-2xl bg-accent-green/10 items-center justify-center mb-4">
            <Typography variant="headline-md">🔑</Typography>
          </View>
          <Typography variant="headline-md" weight="bold" color="primary" className="mb-2">
            비밀번호 찾기
          </Typography>
          <Typography variant="label-sm" color="secondary" className="text-center leading-5">
            가입한 이메일 주소를 입력하면{'\n'}
            재설정 링크를 보내드립니다.
          </Typography>
        </View>

        {/* Error */}
        {error ? (
          <View className="bg-accent-red/10 rounded-xl p-3 mb-4">
            <Typography variant="label-sm" color="expense" className="text-center">
              {error}
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
            error={error}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={onResetPress}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={onResetPress}
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '재설정 링크 보내기'}
          </Button>
        </View>

        {/* Back to Login */}
        <TouchableOpacity
          className="items-center"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Typography variant="label-sm" color="accent" weight="medium">
            로그인으로 돌아가기
          </Typography>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
