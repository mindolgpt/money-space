import { View, Text, TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Utensils, ShoppingCart, Car, Coffee, Film, Pill, Wallet, FileText, Gift } from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
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

function CategoryGridItem({ item, selectedId, onSelect }: CategoryItemProps) {
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
    <Animated.View style={animStyle} className="w-1/4 px-1 mb-3">
      <TouchableOpacity
        className={`items-center py-3 rounded-lg border ${
          isSelected
            ? 'bg-accent-green border-accent-green'
            : 'bg-transparent border-border'
        }`}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.7}
      >
        <View
          className={`w-11 h-11 rounded-full items-center justify-center mb-1.5 ${
            isSelected ? 'bg-bg-secondary/20' : 'bg-bg-tertiary border border-border'
          }`}
        >
          <IconComponent
            size={20}
            color={isSelected ? colors.white : colors.textTertiary}
          />
        </View>
        <Text
          className={`text-[11px] font-semibold ${
            isSelected ? 'text-white' : 'text-text-secondary'
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
    <View className="mb-5">
      <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-3">카테고리</Text>
      <View className="flex-row flex-wrap -mx-1">
        {categories.map((cat) => (
          <CategoryGridItem
            key={cat.id}
            item={cat}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  )
}
