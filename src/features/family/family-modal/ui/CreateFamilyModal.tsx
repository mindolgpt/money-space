import {
  View,
  Text,
  Modal,
} from 'react-native'
import { Button, Input } from '@/shared/ui'
import { useCreateFamilyModal } from '../model/use-create-family-modal'

type Props = {
  onClose: () => void
}

export function CreateFamilyModal({ onClose }: Props) {
  const { name, nameError, isPending, onNameChange, onCreate } = useCreateFamilyModal(onClose)

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" className="text-accent-green" onPress={onClose}>
            취소
          </Button>
          <Text className="text-headline-md font-bold text-text-primary">가족 생성</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="p-6">
          <Input
            variant="box"
            label="가족 이름"
            placeholder="예: 김씨 가족"
            value={name}
            onChangeText={onNameChange}
            maxLength={30}
            editable={!isPending}
            error={nameError}
            hint={`${name.length}/30`}
          />

          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={isPending}
            disabled={!name.trim() || isPending}
            onPress={onCreate}
          >
            {isPending ? '생성 중...' : '가족 생성'}
          </Button>
        </View>
      </View>
    </Modal>
  )
}
