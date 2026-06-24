import {
  View,
  Text,
  Modal,
} from 'react-native'
import { Button, Input } from '@/shared/ui'
import { useJoinFamilyModal } from '../model/use-join-family-modal'

type Props = {
  onClose: () => void
}

export function JoinFamilyModal({ onClose }: Props) {
  const { code, errorMessage, isValidCode, isPending, onCodeChange, onJoin } = useJoinFamilyModal(onClose)

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" className="text-accent-green" onPress={onClose}>
            취소
          </Button>
          <Text className="text-headline-md font-bold text-text-primary">초대 코드 입력</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="p-6">
          <Input
            variant="box"
            className="text-center text-2xl tracking-[8px]"
            placeholder="ABCDEF"
            value={code}
            onChangeText={onCodeChange}
            autoCapitalize="characters"
            maxLength={6}
            editable={!isPending}
            error={errorMessage}
            hint={isValidCode ? '유효한 코드입니다' : '영문 대문자 + 숫자 6자리'}
          />

          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={isPending}
            disabled={code.length !== 6 || isPending}
            onPress={onJoin}
          >
            {isPending ? '참여 중...' : '참여하기'}
          </Button>
        </View>
      </View>
    </Modal>
  )
}
