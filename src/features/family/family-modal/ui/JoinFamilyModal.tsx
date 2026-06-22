import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useJoinFamily } from '@/entities/family'

type Props = {
  onClose: () => void
}

export function JoinFamilyModal({ onClose }: Props) {
  const { user } = useAuthStore()
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null)
  const { mutateAsync: joinFamily, isPending } = useJoinFamily()

  const onCodeChange = (text: string) => {
    const upper = text.toUpperCase()
    if (upper.length > 6) return
    if (!/^[A-Z0-9]*$/.test(upper)) return

    setCode(upper)
    setErrorMessage('')
    setIsValidCode(null)

    if (upper.length === 6) {
      setIsValidCode(true)
    }
  }

  const onJoin = async () => {
    if (!code || code.length !== 6 || !user) return

    try {
      await joinFamily({ inviteCode: code, userId: user.id })
      onClose()
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg === 'ALREADY_MEMBER') {
        setErrorMessage('이미 참여한 가족입니다')
      } else if (msg === 'CODE_EXPIRED') {
        setErrorMessage('초대 코드가 만료되었습니다')
      } else if (msg === 'INVALID_CODE') {
        setErrorMessage('유효하지 않은 코드입니다')
      } else {
        setErrorMessage('참여에 실패했습니다')
      }
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-accent-blue text-base">취소</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">초대 코드 입력</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="p-6">
          <Text className="text-sm text-text-secondary mb-2">
            초대 코드 6자리를 입력하세요
          </Text>
          <TextInput
            className={`input text-center text-2xl tracking-[8px] mb-1 ${
              errorMessage ? 'border-accent-red' : isValidCode ? 'border-accent-green' : ''
            }`}
            placeholder="ABCDEF"
            placeholderTextColor="#C7C7CC"
            value={code}
            onChangeText={onCodeChange}
            autoCapitalize="characters"
            maxLength={6}
            editable={!isPending}
          />
          {errorMessage ? (
            <Text className="text-accent-red text-xs mb-6">{errorMessage}</Text>
          ) : isValidCode ? (
            <Text className="text-accent-green text-xs mb-6">유효한 코드입니다</Text>
          ) : (
            <Text className="text-xs text-text-tertiary mb-6">영문 대문자 + 숫자 6자리</Text>
          )}

          <TouchableOpacity
            className={`btn py-4 flex-row justify-center items-center ${
              code.length !== 6 || isPending ? 'bg-accent-blue/60' : 'btn-primary'
            }`}
            onPress={onJoin}
            disabled={code.length !== 6 || isPending}
          >
            {isPending ? <ActivityIndicator color="white" className="mr-2" /> : null}
            <Text className="text-white font-semibold text-base">
              {isPending ? '참여 중...' : '참여하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}