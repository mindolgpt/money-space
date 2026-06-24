import { useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated'
import { X, ChevronUp, ChevronDown } from 'lucide-react-native'
import { useCategoryManager } from '@/features/category/category-manager/model/use-category-manager'
import { CategoryCreateModal, CategoryEditModal } from '@/features/category/category-modal'
import { colors } from '@/shared/lib/colors'
import { Button, CategoryPill, Typography, IconCircle } from '@/shared/ui'
import type { Category, CategoryType } from '@/entities/category'

const TABS: { key: CategoryType; label: string }[] = [
  { key: 'income', label: '수입' },
  { key: 'expense', label: '지출' },
  { key: 'saving', label: '저축' },
]

type Props = {
  onClose?: () => void
}

export function CategoryManager({ onClose }: Props) {
  const {
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
  } = useCategoryManager()

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => (
    <CategoryItem
      category={item}
      onPress={() => onCategorySelect(item)}
      onDelete={() => onDeleteCategory(item)}
      isDragging={isDragging}
    />
  ), [onCategorySelect, onDeleteCategory, isDragging])

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Button variant="ghost" onPress={onClose}>닫기</Button>
        <Typography variant="headline-md">카테고리 관리</Typography>
        <View className="flex-row gap-2">
          {!isDragging ? (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setIsDragging(true)}
            >
              순서 편집
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onPress={() => setIsDragging(false)}
            >
              완료
            </Button>
          )}
          <Button variant="ghost" onPress={() => setShowCreateModal(true)}>+ 추가</Button>
        </View>
      </View>

      <View className="flex-row px-4 mb-4 gap-2">
        {TABS.map((tab) => (
          <CategoryPill
            key={tab.key}
            label={tab.label}
            active={selectedType === tab.key}
            variant="green"
            onPress={() => onTypeTabChange(tab.key)}
          />
        ))}
      </View>

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
            <Typography variant="body-md" color="tertiary">카테고리가 없습니다</Typography>
          </View>
        }
      />

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
            <Typography variant="body-md" weight="medium" color="primary">
              {category.name}
            </Typography>
            {category.isSystem && (
              <Typography variant="label-sm" color="tertiary">시스템 카테고리</Typography>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {!category.isSystem && (
            <TouchableOpacity onPress={onDelete}>
              <IconCircle icon={X} variant="red" size="sm" />
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
            <Typography variant="body-md" weight="medium" color="primary">
              {category.name}
            </Typography>
            <Typography variant="label-sm" color="accent">순서 변경 중...</Typography>
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
