import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useCreateFamily } from '@/entities/family'

type Props = {
  onClose: () => void
}

export function CreateFamilyModal({ onClose }: Props) {
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const { mutateAsync: createFamily, isPending } = useCreateFamily()

  const onNameChange = (text: string) => {
    if (text.length > 30) return
    setName(text)
    if (text.trim()) setNameError('')
  }

  const onCreate = async () => {
    if (!name.trim()) {
      setNameError('가족 이름을 입력해주세요')
      return
    }
    if (!user) return

    try {
      const { inviteCode } = await createFamily({
        name: name.trim(),
        userId: user.id,
      })
      onClose()
      Alert.alert('가족 생성 완료', `초대 코드: ${inviteCode}\n\n멤버에게 이 코드를 공유하여 초대하세요!`)
    } catch {
      setNameError('생성에 실패했습니다')
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-accent-blue text-base">취소</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">가족 생성</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="p-6">
          <Text className="text-sm text-text-secondary mb-2">가족 이름</Text>
          <TextInput
            className={`input mb-1 ${nameError ? 'border-accent-red' : ''}`}
            placeholder="예: 김씨 가족"
            placeholderTextColor="#C7C7CC"
            value={name}
            onChangeText={onNameChange}
            maxLength={30}
            editable={!isPending}
          />
          <View className="flex-row justify-between mb-6">
            {nameError ? (
              <Text className="text-accent-red text-xs">{nameError}</Text>
            ) : null}
            <Text className="text-xs text-text-tertiary ml-auto">{name.length}/30</Text>
          </View>

          <TouchableOpacity
            className={`btn py-4 flex-row justify-center items-center ${
              !name.trim() || isPending ? 'bg-accent-blue/60' : 'btn-primary'
            }`}
            onPress={onCreate}
            disabled={!name.trim() || isPending}
          >
            {isPending ? <ActivityIndicator color="white" className="mr-2" /> : null}
            <Text className="text-white font-semibold text-base">
              {isPending ? '생성 중...' : '가족 생성'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}