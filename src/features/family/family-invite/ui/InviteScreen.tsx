import { View, Text } from 'react-native'
import { JoinFamilyModal } from '@/features/family/family-modal'
import { Button, Input } from '@/shared/ui'
import { useInviteScreen } from '../model/use-invite-screen'

type Props = {
  familyId: string
}

export function InviteScreen({ familyId }: Props) {
  const {
    user,
    inviteEmail,
    showJoinModal,
    isPending,
    setInviteEmail,
    setShowJoinModal,
    handleSend,
  } = useInviteScreen(familyId)

  if (!familyId && !user) {
    return null
  }

  if (!familyId && user) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-accent-green/10 items-center justify-center mb-4">
          <Text className="text-3xl">👨‍👩‍👧</Text>
        </View>
        <Text className="text-headline-md font-bold text-text-primary mb-2">
          가족이 없습니다
        </Text>
        <Text className="text-body-md text-text-secondary text-center mb-6">
          초대 코드를 입력하여 가족에 참여하세요
        </Text>
        <Button variant="primary" onPress={() => setShowJoinModal(true)}>
          초대 코드 입력
        </Button>

        {showJoinModal && (
          <JoinFamilyModal onClose={() => setShowJoinModal(false)} />
        )}
      </View>
    )
  }

  return (
    <View className="p-6">
      <Text className="text-headline-md font-bold mb-4">배우자 초대하기</Text>
      <Text className="text-body-md text-text-secondary mb-4">
        배우자의 이메일을 입력하면 초대장이 발송됩니다.
      </Text>
      <Input
        variant="box"
        placeholder="배우자 이메일"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button variant="primary" fullWidth loading={isPending} onPress={handleSend}>
        초대 보내기
      </Button>
    </View>
  )
}
