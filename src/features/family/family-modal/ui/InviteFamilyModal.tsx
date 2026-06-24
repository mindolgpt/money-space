import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native'
import { Button } from '@/shared/ui'
import { useInviteFamilyModal } from '../model/use-invite-family-modal'

type Props = {
  familyId: string
  familyName: string
  onClose: () => void
}

export function InviteFamilyModal({ familyId, familyName, onClose }: Props) {
  const { inviteCode, isPending, onCopyCode, onSharePress, onRefreshCode } = useInviteFamilyModal(familyId, familyName)

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" className="text-accent-green" onPress={onClose}>
            닫기
          </Button>
          <Text className="text-headline-md font-bold text-text-primary">초대하기</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <View className="w-24 h-24 rounded-full bg-accent-green/10 items-center justify-center mb-6">
            <Text className="text-4xl">🎉</Text>
          </View>

          <Text className="text-headline-md font-bold text-text-primary mb-2">
            {familyName}
          </Text>
          <Text className="text-body-md text-text-secondary text-center mb-8">
            아래 코드를 공유하여 가족을 초대하세요
          </Text>

          {inviteCode ? (
            <>
              <TouchableOpacity
                className="bg-bg-tertiary px-12 py-4 rounded-2xl mb-6"
                onPress={onCopyCode}
              >
                <Text className="text-3xl font-bold text-text-primary tracking-[6px]">
                  {inviteCode}
                </Text>
              </TouchableOpacity>

              <Text className="text-label-sm text-text-tertiary mb-8">
                코드를 탭하여 복사
              </Text>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mb-3"
                onPress={onSharePress}
              >
                공유하기
              </Button>

              <Button variant="ghost" className="text-accent-green" onPress={onRefreshCode}>
                새 코드 생성
              </Button>
            </>
          ) : isPending ? (
            <Button variant="primary" loading={isPending}>
              로딩 중...
            </Button>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}
