import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { createCategoryApi } from '@/entities/category'

type Category = {
  id: string
  name: string
  icon: string
  type: string
}

type Props = {
  type: 'income' | 'expense' | 'saving'
  selectedId?: string
  onSelect: (id: string) => void
}

type CategoryItemProps = {
  item: Category
  selectedId?: string
  onSelect: (id: string) => void
}

function CategoryItem({ item, selectedId, onSelect }: CategoryItemProps) {
  const animStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(selectedId === item.id ? 1.1 : 1, {
            stiffness: 150,
            damping: 8,
          }),
        },
      ],
    }),
    [selectedId, item.id],
  )

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        className={`px-4 py-2 rounded-full mr-2 ${
          selectedId === item.id ? 'bg-blue-500' : 'bg-gray-100'
        }`}
        onPress={() => onSelect(item.id)}
      >
        <Text
          className={selectedId === item.id ? 'text-white' : 'text-gray-700'}
        >
          {item.icon} {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export function CategoryPicker({ type, selectedId, onSelect }: Props) {
  const [categories] = useState<Category[]>(() => {
    const categoryApi = createCategoryApi()
    return categoryApi.getByType(type)
  })

  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-2">카테고리</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CategoryItem
            item={item}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      />
    </View>
  )
}
