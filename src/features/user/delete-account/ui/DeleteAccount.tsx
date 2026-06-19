import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useDeleteAccount } from '@/entities/user'

export function DeleteAccount() {
  const { user, signOut } = useAuthStore()
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const onPasswordChange = (text: string) => {
    setPassword(text)
    if (text) setPasswordError('')
  }

  const executeDelete = async () => {
    if (!user) return
    try {
      await deleteAccount(user.id)
      await signOut()
    } catch (e: any) {
      const message = e?.message ?? ''
      if (message.includes('Invalid password') || message.includes('invalid_credentials')) {
        setPasswordError('비밀번호가 올바르지 않습니다')
        setPassword('')
      } else {
        Alert.alert('오류', '계정 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const onDeletePress = () => {
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요')
      return
    }
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: executeDelete,
        },
      ],
    )
  }

  return (
    <View>
      <Text className="text-base font-semibold text-primary mb-4">
        계정 삭제
      </Text>

      <View className="card p-4 mb-4 border border-accent-red/20">
        <Text className="text-sm text-secondary mb-2 leading-5">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </Text>

        <Text className="text-sm text-secondary mb-2">비밀번호 확인</Text>
        <TextInput
          className={`input mb-1 ${passwordError ? 'border-accent-red' : ''}`}
          placeholder="현재 비밀번호"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
        />
        {passwordError ? (
          <Text className="text-accent-red text-xs mb-3 ml-1">
            {passwordError}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`py-3 rounded-xl items-center mt-2 flex-row justify-center ${
            isPending ? 'bg-accent-red/60' : 'bg-accent-red'
          }`}
          onPress={onDeletePress}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-semibold">
            {isPending ? '처리 중...' : '계정 삭제'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
