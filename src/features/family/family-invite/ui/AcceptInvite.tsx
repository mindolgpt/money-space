import { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useJoinFamily } from '@/entities/family'
import { router } from 'expo-router'
import { Button } from '@/shared/ui'

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
    <View className="flex-1 justify-center items-center p-6 bg-bg-primary">
      <Text className="text-2xl font-bold text-text-primary mb-2 tracking-tight">가계부 초대</Text>
      <Text className="text-text-secondary mb-8">
        초대 코드를 입력하여 가족에 참여하세요
      </Text>
      <TextInput
        className={`w-full bg-bg-tertiary rounded-xl text-center text-2xl tracking-[8px] p-4 text-text-primary mb-4 ${
          error ? 'border border-semantic-expense' : ''
        }`}
        placeholder="ABCDEF"
        placeholderTextColor="#C7C7CC"
        value={code}
        onChangeText={onCodeChange}
        autoCapitalize="characters"
        maxLength={6}
        editable={!isPending}
      />
      {error ? (
        <Text className="text-semantic-expense text-xs mb-4 font-medium">{error}</Text>
      ) : null}
      <Button
        variant="primary"
        size="lg"
        loading={isPending}
        onPress={handleAccept}
        disabled={isPending || code.length !== 6}
      >
        {isPending ? '처리 중...' : '참여하기'}
      </Button>
    </View>
  )
}
