import { useState } from 'react'
import { Alert } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useDeleteAccount as useDeleteAccountMutation } from '@/entities/user'

export function useDeleteAccount() {
  const { user, signOut } = useAuthStore()
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccountMutation()
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

  return {
    password,
    passwordError,
    isPending,
    onPasswordChange,
    onDeletePress,
  }
}
