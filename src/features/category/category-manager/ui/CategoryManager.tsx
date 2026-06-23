import { useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated'
import { useCategories, useDeleteCategory, useReorderCategories } from '@/entities/category'
import type { Category, CategoryType } from '@/entities/category'
import { CategoryCreateModal , CategoryEditModal } from '@/features/category/category-modal'
import { colors } from '@/shared/lib/colors'
import { X, ChevronUp, ChevronDown } from 'lucide-react-native'

const TABS: { key: CategoryType; label: string }[] = [
  { key: 'income', label: '수입' },
  { key: 'expense', label: '지출' },
  { key: 'saving', label: '저축' },
]

type Props = {
  onClose?: () => void
}

export function CategoryManager({ onClose }: Props) {
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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryItem
      category={item}
      onPress={() => onCategorySelect(item)}
      onDelete={() => onDeleteCategory(item)}
      isDragging={isDragging}
    />
  )

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-accent-green text-base">닫기</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary">카테고리 관리</Text>
        <View className="flex-row gap-2">
          {!isDragging ? (
            <TouchableOpacity
              onPress={() => setIsDragging(true)}
              className="px-3 py-1.5 rounded-lg bg-bg-tertiary"
            >
              <Text className="text-accent-green text-sm font-medium">순서 편집</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsDragging(false)}
              className="px-3 py-1.5 rounded-lg bg-accent-green"
            >
              <Text className="text-white text-sm font-medium">완료</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Text className="text-accent-green text-base">+ 추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Type Tabs */}
      <View className="flex-row px-4 mb-4 gap-2">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`px-5 py-2 rounded-full ${
              selectedType === tab.key ? 'bg-accent-green' : 'bg-bg-tertiary'
            }`}
            onPress={() => onTypeTabChange(tab.key)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedType === tab.key ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item, index }) => (
          isDragging ? (
            <DraggableCategoryItem
              category={item}
              index={index}
              total={categories.length}
              onMove={(dir) => moveItem(index, dir)}
            />
          ) : (
            renderCategoryItem({ item })
          )
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-text-tertiary">카테고리가 없습니다</Text>
          </View>
        }
      />

      {/* Modals */}
      {showCreateModal && (
        <CategoryCreateModal
          type={selectedType}
          onClose={() => setShowCreateModal(false)}
        />
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

type CategoryItemProps = {
  category: Category
  onPress: () => void
  onDelete: () => void
  isDragging: boolean
}

function CategoryItem({ category, onPress, onDelete, isDragging }: CategoryItemProps) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDragging ? 0.6 : 1, { duration: 200 }),
    transform: [{ scale: withSpring(isDragging ? 0.95 : 1) }],
  }))

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        className="flex-row items-center justify-between py-3.5 px-4 rounded-lg bg-bg-secondary mb-2"
        onPress={onPress}
        onLongPress={onDelete}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-xl mr-3">{category.icon}</Text>
          <View className="flex-1">
            <Text className="text-base font-medium text-text-primary">
              {category.name}
            </Text>
            {category.isSystem && (
              <Text className="text-xs text-text-tertiary">시스템 카테고리</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {!category.isSystem && (
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-accent-red/10 items-center justify-center"
              onPress={onDelete}
            >
              <X size={16} color={colors.accentRed} />
            </TouchableOpacity>
          )}
          <Text className="text-text-tertiary">⋮⋮</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

type DraggableCategoryItemProps = {
  category: Category
  index: number
  total: number
  onMove: (direction: -1 | 1) => void
}

function DraggableCategoryItem({ category, index, total, onMove }: DraggableCategoryItemProps) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(
          withTiming(1.02, { duration: 100 }),
          withSpring(1),
        ),
      },
    ],
  }))

  return (
    <Animated.View style={[animStyle, { zIndex: 10 }]}>
      <View className="flex-row items-center justify-between py-3.5 px-4 rounded-lg bg-accent-green/10 border border-accent-green/30 mb-2">
        <View className="flex-row items-center flex-1">
          <Text className="text-xl mr-3">{category.icon}</Text>
          <View className="flex-1">
            <Text className="text-base font-medium text-text-primary">
              {category.name}
            </Text>
            <Text className="text-xs text-accent-green">순서 변경 중...</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            className={`w-9 h-9 rounded-full items-center justify-center ${index === 0 ? 'bg-bg-tertiary' : 'bg-accent-green/20'}`}
            onPress={() => onMove(-1)}
            disabled={index === 0}
          >
            <ChevronUp size={20} color={index === 0 ? colors.textTertiary : colors.accentGreen} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-9 h-9 rounded-full items-center justify-center ${index === total - 1 ? 'bg-bg-tertiary' : 'bg-accent-green/20'}`}
            onPress={() => onMove(1)}
            disabled={index === total - 1}
          >
            <ChevronDown size={20} color={index === total - 1 ? colors.textTertiary : colors.accentGreen} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}