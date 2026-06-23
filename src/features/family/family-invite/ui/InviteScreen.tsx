import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useInviteByEmail } from '@/entities/family'
import { JoinFamilyModal } from '@/features/family/family-modal'

type Props = {
  familyId: string
}

export function InviteScreen({ familyId }: Props) {
  const { user } = useAuthStore()
  const [inviteEmail, setInviteEmail] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { mutateAsync: sendInvite, isPending } = useInviteByEmail()

  const handleSend = async () => {
    await sendInvite({ email: inviteEmail, familyId })
    setInviteEmail('')
  }

  if (!familyId && !user) {
    return null
  }

  if (!familyId && user) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-accent-green/10 items-center justify-center mb-4">
          <Text className="text-3xl">👨‍👩‍👧</Text>
        </View>
        <Text className="text-lg font-bold text-text-primary mb-2">
          가족이 없습니다
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-6">
          초대 코드를 입력하여 가족에 참여하세요
        </Text>
        <TouchableOpacity
          className="bg-accent-green py-3 px-8 rounded-lg"
          onPress={() => setShowJoinModal(true)}
        >
          <Text className="text-white font-semibold">초대 코드 입력</Text>
        </TouchableOpacity>

        {showJoinModal && (
          <JoinFamilyModal onClose={() => setShowJoinModal(false)} />
        )}
      </View>
    )
  }

  return (
    <View className="p-6">
      <Text className="text-lg font-bold mb-4">배우자 초대하기</Text>
      <Text className="text-text-secondary mb-4">
        배우자의 이메일을 입력하면 초대장이 발송됩니다.
      </Text>
      <TextInput
        className="border border-border rounded-lg p-3 mb-4"
        placeholder="배우자 이메일"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        className="bg-accent-green rounded-lg p-3 items-center"
        onPress={handleSend}
        disabled={isPending}
      >
        <Text className="text-white font-bold">
          {isPending ? '전송 중...' : '초대 보내기'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
