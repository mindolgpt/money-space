import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Utensils, ShoppingCart, Car, Coffee, Film, Pill, Wallet, FileText, Gift } from 'lucide-react-native'
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

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  food: Utensils,
  shopping: ShoppingCart,
  transport: Car,
  cafe: Coffee,
  entertainment: Film,
  health: Pill,
  salary: Wallet,
  gift: Gift,
  etc: FileText,
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
          {(() => {
            const Icon = CATEGORY_ICON_MAP[item.id] || FileText
            return <Icon size={16} color={selectedId === item.id ? '#FFFFFF' : '#86868B'} />
          })()}
        </Text>
        <Text
          className={`text-sm font-medium ${
            selectedId === item.id ? 'text-white' : 'text-text-secondary'
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
      <Text className="text-sm text-text-secondary mb-2">카테고리</Text>
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