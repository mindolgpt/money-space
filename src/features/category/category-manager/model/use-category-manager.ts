import { useState, useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import { useCategories, useDeleteCategory, useReorderCategories } from '@/entities/category'
import type { Category, CategoryType } from '@/entities/category'

export function useCategoryManager() {
  const [selectedType, setSelectedType] = useState<CategoryType>('expense')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { data: categories = [] } = useCategories(selectedType)
  const { mutate: deleteCategory } = useDeleteCategory()
  const { mutate: reorder } = useReorderCategories()

  const localCategories = useRef<Category[]>(categories)
  localCategories.current = categories

  const onTypeTabChange = useCallback((type: CategoryType) => {
    setSelectedType(type)
    setIsDragging(false)
  }, [])

  const onCategorySelect = useCallback((category: Category) => {
    if (category.isSystem) {
      Alert.alert('알림', '시스템 카테고리는 수정할 수 없습니다')
    } else {
      setEditingCategory(category)
    }
  }, [])

  const onDeleteCategory = useCallback((category: Category) => {
    if (category.isSystem) {
      Alert.alert('알림', '시스템 카테고리는 삭제할 수 없습니다')
      return
    }

    Alert.alert(
      '카테고리 삭제',
      `"${category.name}" 카테고리를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ],
    )
  }, [deleteCategory])

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    const items = [...localCategories.current]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const temp = items[index]
    items[index] = items[targetIndex]
    items[targetIndex] = temp

    const newOrder = items.map((c) => c.id)
    reorder(newOrder)
  }, [reorder])

  return {
    selectedType,
    editingCategory,
    showCreateModal,
    isDragging,
    categories,
    onTypeTabChange,
    onCategorySelect,
    onDeleteCategory,
    moveItem,
    setEditingCategory,
    setShowCreateModal,
    setIsDragging,
  }
}
