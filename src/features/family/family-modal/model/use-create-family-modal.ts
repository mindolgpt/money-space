import { useState } from 'react'
import { Alert } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useCreateFamily } from '@/entities/family'

export function useCreateFamilyModal(onClose: () => void) {
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

  return {
    name,
    nameError,
    isPending,
    onNameChange,
    onCreate,
  }
}
