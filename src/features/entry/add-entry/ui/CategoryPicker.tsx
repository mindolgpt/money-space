import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useCategories } from '@/entities/category'

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

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  shopping: '🛒',
  transport: '🚗',
  cafe: '☕',
  entertainment: '🎬',
  health: '💊',
  salary: '💰',
  gift: '🎁',
  etc: '📝',
}

function CategoryItem({ item, selectedId, onSelect }: CategoryItemProps) {
  const animStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(selectedId === item.id ? 1.05 : 1, {
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
        className={`px-4 py-2.5 rounded-full mr-2 flex-row items-center ${
          selectedId === item.id ? 'bg-accent-blue' : 'bg-bg-tertiary'
        }`}
        onPress={() => onSelect(item.id)}
      >
        <Text className="text-sm mr-1.5">
          {CATEGORY_ICONS[item.id] || '📝'}
        </Text>
        <Text
          className={`text-sm font-medium ${
            selectedId === item.id ? 'text-white' : 'text-secondary'
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export function CategoryPicker({ type, selectedId, onSelect }: Props) {
  const { data: categories = [] } = useCategories(type)

  return (
    <View className="mb-4">
      <Text className="text-sm text-secondary mb-2">카테고리</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CategoryItem
            item={item}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  )
}