import { useState, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useCategories, useDeleteCategory } from '@/entities/category'
import type { Category, CategoryType } from '@/entities/category'
import { CategoryEditModal } from '@/features/category/category-modal'

type Props = {
  type: CategoryType
  selectedId?: string
  onSelect: (category: Category) => void
  closeOnSelect?: boolean
  onClose?: () => void
  showSearch?: boolean
  allowContextMenu?: boolean
}

export function CategoryPicker({
  type,
  selectedId,
  onSelect,
  closeOnSelect,
  onClose,
  showSearch = false,
  allowContextMenu = false,
}: Props) {
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

  return (
    <View>
      {showSearch && (
        <TextInput
          className="input mb-3"
          placeholder="카테고리 검색"
          placeholderTextColor="#C7C7CC"
          value={searchQuery}
          onChangeText={onSearchFilterChange}
        />
      )}

      {filteredCategories.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-text-tertiary">
            {searchQuery ? '검색 결과가 없습니다' : '카테고리가 없습니다'}
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {filteredCategories.map((category) => (
            <CategoryPickerItem
              key={category.id}
              category={category}
              isSelected={category.id === selectedId}
              onPress={() => onCategoryItemPress(category)}
              onLongPress={() => onCategoryItemLongPress(category)}
            />
          ))}
        </View>
      )}

      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </View>
  )
}

type ItemProps = {
  category: Category
  isSelected: boolean
  onPress: () => void
  onLongPress: () => void
}

function CategoryPickerItem({ category, isSelected, onPress, onLongPress }: ItemProps) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.08 : 1, {
          stiffness: 150,
          damping: 8,
        }),
      },
    ],
  }))

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        className={`px-4 py-3 rounded-xl items-center min-w-[72px] ${
          isSelected ? 'bg-accent-blue' : 'bg-bg-tertiary'
        }`}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Text className="text-xl mb-1">{category.icon}</Text>
        <Text
          className={`text-xs font-medium ${
            isSelected ? 'text-white' : 'text-text-secondary'
          }`}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
