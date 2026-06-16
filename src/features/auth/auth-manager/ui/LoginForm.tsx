import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager/model/use-auth-store'

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn } = useAuthStore()

  const handleLogin = async () => {
    try {
      setError('')
      await signIn(email, password)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-2xl font-bold mb-8">로그인</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 items-center"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold">로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-4 items-center" onPress={onSwitch}>
        <Text className="text-blue-500">계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  )
}
