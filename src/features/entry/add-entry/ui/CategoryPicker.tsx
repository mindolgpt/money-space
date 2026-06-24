import { View, Text } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Utensils, ShoppingCart, Car, Coffee, Film, Pill, Wallet, FileText, Gift } from 'lucide-react-native'
import { CategoryPill } from '@/shared/ui'
import { useCategories, type Category } from '@/entities/category'

type Props = {
  type: 'income' | 'expense' | 'saving'
  selectedId?: string
  onSelect: (id: string) => void
}

type CategoryItemProps = {
  item: Category
  selectedId?: string
  onSelect: (id: string) => void
  variantPill: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
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

function CategoryGridItem({ item, selectedId, onSelect, variantPill }: CategoryItemProps) {
  const isSelected = selectedId === item.id
  const animStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(isSelected ? 1.05 : 1, {
            stiffness: 150,
            damping: 8,
          }),
        },
      ],
    }),
    [isSelected],
  )

  const IconComponent = CATEGORY_ICON_MAP[item.id] || FileText

  return (
    <Animated.View style={animStyle} className="w-1/4 px-1 mb-3 items-center">
      <CategoryPill
        icon={IconComponent}
        label={item.name}
        active={isSelected}
        variant={variantPill}
        size="md"
        onPress={() => onSelect(item.id)}
      />
    </Animated.View>
  )
}

export function CategoryPicker({ type, selectedId, onSelect }: Props) {
  const { data: categories = [] } = useCategories(type)

  const variantPill: 'green' | 'red' | 'blue' = type === 'income' ? 'green' : type === 'saving' ? 'blue' : 'red'

  return (
    <View className="mb-5">
      <Text className="text-label-md font-semibold text-text-secondary tracking-widest uppercase mb-3">카테고리</Text>
      <View className="flex-row flex-wrap -mx-1">
        {categories.map((cat) => (
          <CategoryGridItem
            key={cat.id}
            item={cat}
            selectedId={selectedId}
            onSelect={onSelect}
            variantPill={variantPill}
          />
        ))}
      </View>
    </View>
  )
}
