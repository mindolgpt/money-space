import { View, Text } from 'react-native'
import { Entry } from '@/entities/entry'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated'
import { type LucideIcon, Utensils, ShoppingCart, Car, Coffee, Film, Pill, Wallet, FileText } from 'lucide-react-native'

type Props = {
  entries: Entry[]
  type: 'expense' | 'income'
}

type CategoryBarProps = {
  cat: string
  catIcon: LucideIcon
  amount: number
  total: number
  index: number
  color: string
  type: 'expense' | 'income'
}

const CATEGORY_COLORS = [
  '#FF453A',
  '#FF9F0A',
  '#FFD60A',
  '#30D158',
  '#BF5AF2',
  '#0A84FF',
  '#FF375F',
  '#64D2FF',
]

function CategoryBar({
  cat,
  catIcon: IconComponent,
  amount,
  total,
  index,
  color,
  type,
}: CategoryBarProps) {
  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0

  const barAnim = useAnimatedStyle(
    () => ({
      width: withDelay(
        index * 100,
        withSpring(`${Math.min(percentage, 100)}%`, {
          stiffness: 80,
          damping: 12,
        }),
      ),
    }),
    [amount, total, index, percentage],
  )

  return (
    <View className="flex-row items-center mb-4">
      <View className="w-16 flex-row items-center">
        <IconComponent size={16} color="#86868B" />
        <Text className="text-xs text-text-secondary ml-1.5" numberOfLines={1}>
          {cat}
        </Text>
      </View>
      <View className="flex-1 h-7 mx-2 bg-bg-tertiary rounded-lg overflow-hidden">
        <Animated.View
          style={[barAnim, { backgroundColor: color }]}
          className="h-full rounded-lg"
        />
      </View>
      <Text
        className={`text-xs font-medium w-12 text-right ${
          type === 'expense' ? 'amount-expense' : 'amount-income'
        }`}
      >
        {percentage}%
      </Text>
    </View>
  )
}

export function CategoryChart({ entries, type }: Props) {
  const filtered = entries.filter((e) => e.type === type)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const grouped: Record<string, { amount: number; icon: LucideIcon }> = {}
  for (const e of filtered) {
    const key = e.categoryId || '기타'
    if (!grouped[key]) {
      const icons: Record<string, LucideIcon> = {
        food: Utensils,
        shopping: ShoppingCart,
        transport: Car,
        cafe: Coffee,
        entertainment: Film,
        health: Pill,
        salary: Wallet,
        etc: FileText,
      }
      grouped[key] = { amount: 0, icon: icons[e.categoryId || 'etc'] || FileText }
    }
    grouped[key].amount += e.amount
  }

  const sorted = Object.entries(grouped).sort(([, a], [, b]) => b.amount - a.amount)

  return (
    <View className="card p-4 mx-4 mt-4">
      <Text className="text-base font-semibold text-text-primary mb-4">
        {type === 'expense' ? '지출 카테고리' : '수입 카테고리'}
      </Text>
      {sorted.length > 0 ? (
        sorted.map(([cat, data], index) => (
          <CategoryBar
            key={cat}
            cat={cat}
            catIcon={data.icon}
            amount={data.amount}
            total={total}
            index={index}
            color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
            type={type}
          />
        ))
      ) : (
        <View className="py-8 items-center">
          <Text className="text-text-tertiary text-sm">내역이 없습니다</Text>
        </View>
      )}
    </View>
  )
}
