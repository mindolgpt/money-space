import { useState } from 'react'
import { useUpdateCategory } from '@/entities/category'
import type { Category } from '@/entities/category'

export function useCategoryEdit(category: Category, onClose: () => void) {
  const [name, setName] = useState(category.name)
  const [selectedIcon, setSelectedIcon] = useState(category.icon)
  const [nameError, setNameError] = useState('')
  const { mutateAsync: updateCategory, isPending } = useUpdateCategory()

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

    const hasChanged = name.trim() !== category.name || selectedIcon !== category.icon
    if (!hasChanged) {
      onClose()
      return
    }

    try {
      await updateCategory({
        id: category.id,
        input: { name: name.trim(), icon: selectedIcon },
      })
      onClose()
    } catch {
      setNameError('수정에 실패했습니다')
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
