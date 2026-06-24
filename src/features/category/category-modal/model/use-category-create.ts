import { useState } from 'react'
import { useCreateCategory } from '@/entities/category'
import type { CategoryType } from '@/entities/category'

export function useCategoryCreate(type: CategoryType, onClose: () => void) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('')
  const [nameError, setNameError] = useState('')
  const { mutateAsync: createCategory, isPending } = useCreateCategory()

  const onNameChange = (text: string) => {
    if (text.length > 20) return
    setName(text)
    if (text.trim()) setNameError('')
  }

  const onIconSelect = (icon: string) => {
    setSelectedIcon(icon)
  }

  const onSave = async () => {
    if (!selectedIcon) return
    if (!name.trim()) {
      setNameError('카테고리명을 입력해주세요')
      return
    }

    try {
      await createCategory({
        name: name.trim(),
        icon: selectedIcon,
        type,
      })
      onClose()
    } catch {
      setNameError('생성에 실패했습니다')
    }
  }

  return {
    name,
    selectedIcon,
    nameError,
    isPending,
    onNameChange,
    onIconSelect,
    onSave,
  }
}
