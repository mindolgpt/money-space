import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useInviteByEmail } from '@/entities/family'

type Props = {
  familyId: string
}

export function InviteScreen({ familyId }: Props) {
  const [inviteEmail, setInviteEmail] = useState('')
  const { mutateAsync: sendInvite, isPending } = useInviteByEmail()

  const handleSend = async () => {
    await sendInvite({ email: inviteEmail, familyId })
    setInviteEmail('')
  }

  return (
    <View className="p-6">
      <Text className="text-lg font-bold mb-4">배우자 초대하기</Text>
      <Text className="text-gray-500 mb-4">
        배우자의 이메일을 입력하면 초대장이 발송됩니다.
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="배우자 이메일"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 items-center"
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
