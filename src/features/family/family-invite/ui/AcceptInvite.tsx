import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useJoinFamily } from '@/entities/family'
import { router } from 'expo-router'

export function AcceptInvite({ code: initialCode }: { code: string }) {
  const { user } = useAuthStore()
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')
  const { mutateAsync: joinFamily, isPending } = useJoinFamily()

  const onCodeChange = (text: string) => {
    const upper = text.toUpperCase()
    if (upper.length > 6) return
    if (!/^[A-Z0-9]*$/.test(upper)) return
    setCode(upper)
    setError('')
  }

  const handleAccept = async () => {
    if (!user || code.length !== 6) return
    try {
      await joinFamily({ inviteCode: code, userId: user.id })
      router.replace({ pathname: '/(tabs)/shared' } as any)
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg === 'ALREADY_MEMBER') {
        setError('이미 참여한 가족입니다')
      } else if (msg === 'CODE_EXPIRED') {
        setError('초대 코드가 만료되었습니다')
      } else {
        setError('유효하지 않은 초대 코드입니다')
      }
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-xl font-bold mb-4">가계부 초대</Text>
      <Text className="text-gray-500 mb-6">
        초대 코드를 입력하여 가족에 참여하세요
      </Text>
      <TextInput
        className={`input text-center text-2xl tracking-[8px] mb-4 ${
          error ? 'border-accent-red' : ''
        }`}
        placeholder="ABCDEF"
        value={code}
        onChangeText={onCodeChange}
        autoCapitalize="characters"
        maxLength={6}
        editable={!isPending}
      />
      {error ? (
        <Text className="text-accent-red text-xs mb-4">{error}</Text>
      ) : null}
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 px-8 items-center"
        onPress={handleAccept}
        disabled={isPending || code.length !== 6}
      >
        <Text className="text-white font-bold">
          {isPending ? '처리 중...' : '참여하기'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}