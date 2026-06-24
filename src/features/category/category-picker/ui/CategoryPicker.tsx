import { View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useCategoryPicker } from '@/features/category/category-picker/model/use-category-picker'
import { CategoryEditModal } from '@/features/category/category-modal'
import { Input, CategoryPill, Typography } from '@/shared/ui'
import type { Category, CategoryType } from '@/entities/category'

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
  const {
    searchQuery,
    editingCategory,
    filteredCategories,
    onCategoryItemPress,
    onCategoryItemLongPress,
    onSearchFilterChange,
    setEditingCategory,
  } = useCategoryPicker(type, onSelect, closeOnSelect, onClose, allowContextMenu)

  return (
    <View>
      {showSearch && (
        <Input
          variant="box"
          placeholder="카테고리 검색"
          value={searchQuery}
          onChangeText={onSearchFilterChange}
          containerClassName="mb-3"
        />
      )}

      {filteredCategories.length === 0 ? (
        <View className="py-8 items-center">
          <Typography variant="body-md" color="tertiary">
            {searchQuery ? '검색 결과가 없습니다' : '카테고리가 없습니다'}
          </Typography>
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
      <CategoryPill
        emoji={category.icon}
        label={category.name}
        active={isSelected}
        variant="green"
        onPress={onPress}
        onLongPress={onLongPress}
      />
    </Animated.View>
  )
}
