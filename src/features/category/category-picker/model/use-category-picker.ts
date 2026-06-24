import { useState, useMemo } from 'react'
import { Alert } from 'react-native'
import { useCategories, useDeleteCategory } from '@/entities/category'
import type { Category, CategoryType } from '@/entities/category'

export function useCategoryPicker(
  type: CategoryType,
  onSelect: (category: Category) => void,
  closeOnSelect?: boolean,
  onClose?: () => void,
  allowContextMenu?: boolean,
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { data: categories = [] } = useCategories(type)
  const { mutate: deleteCategory } = useDeleteCategory()

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, searchQuery])

  const onCategoryItemPress = (category: Category) => {
    if (closeOnSelect && onClose) {
      setTimeout(() => onClose(), 200)
    }
    onSelect(category)
  }

  const onCategoryItemLongPress = (category: Category) => {
    if (!allowContextMenu || category.isSystem) return

    Alert.alert(category.name, undefined, [
      {
        text: '편집',
        onPress: () => setEditingCategory(category),
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            '카테고리 삭제',
            `"${category.name}"을(를) 삭제하시겠습니까?`,
            [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => deleteCategory(category.id),
              },
            ],
          )
        },
      },
      { text: '취소', style: 'cancel' },
    ])
  }

  const onSearchFilterChange = (text: string) => {
    setSearchQuery(text)
  }

  return {
    searchQuery,
    editingCategory,
    filteredCategories,
    onCategoryItemPress,
    onCategoryItemLongPress,
    onSearchFilterChange,
    setEditingCategory,
  }
}
