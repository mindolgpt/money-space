import { View, Text } from 'react-native'
import { useMemo } from 'react'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated'

type MonthlyData = {
  month: string
  income: number
  expense: number
  saving: number
}

type Props = {
  data: MonthlyData[]
  maxValue?: number
}

export function MonthlyComparisonChart({ data, maxValue }: Props) {
  const max = maxValue ?? Math.max(...data.map((d) => Math.max(d.income, d.expense, d.saving)), 1)

  return (
    <View className="card p-4 mx-4 mt-4">
      <Text className="text-base font-semibold text-text-primary mb-4">
        월별 비교
      </Text>

      {data.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-text-tertiary text-sm">데이터가 없습니다</Text>
        </View>
      ) : (
        <View className="flex-row items-end justify-between h-48 px-2">
          {data.map((item, index) => (
            <MonthBar
              key={item.month}
              month={item.month}
              income={item.income}
              expense={item.expense}
              max={max}
              index={index}
            />
          ))}
        </View>
      )}

      <View className="flex-row justify-center mt-4 gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-accent-green mr-1.5" />
          <Text className="text-xs text-text-secondary">수입</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-accent-red mr-1.5" />
          <Text className="text-xs text-text-secondary">지출</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-accent-blue mr-1.5" />
          <Text className="text-xs text-text-secondary">저축</Text>
        </View>
      </View>
    </View>
  )
}

type MonthBarProps = {
  month: string
  income: number
  expense: number
  max: number
  index: number
}

function MonthBar({ month, income, expense, max, index }: MonthBarProps) {
  const incomeHeight = (income / max) * 100
  const expenseHeight = (expense / max) * 100

  const incomeAnim = useAnimatedStyle(() => ({
    height: withDelay(
      index * 100,
      withSpring(`${Math.min(incomeHeight, 100)}%`, {
        stiffness: 80,
        damping: 12,
      }),
    ),
  }))

  const expenseAnim = useAnimatedStyle(() => ({
    height: withDelay(
      index * 100 + 50,
      withSpring(`${Math.min(expenseHeight, 100)}%`, {
        stiffness: 80,
        damping: 12,
      }),
    ),
  }))

  return (
    <View className="flex-1 items-center">
      <View className="flex-row items-end justify-center gap-1 h-36 w-full px-1">
        <View className="w-5 h-full bg-bg-tertiary/50 rounded-t-lg relative overflow-hidden">
          <Animated.View
            style={[incomeAnim, { backgroundColor: '#34C759', borderRadius: 4 }]}
            className="absolute bottom-0 w-full"
          />
          <Animated.View
            style={[expenseAnim, { backgroundColor: '#FF3B30', borderRadius: 4 }]}
            className="absolute bottom-0 w-full"
          />
        </View>
      </View>
      <Text className="text-xs text-text-secondary mt-2">{month}</Text>
    </View>
  )
}

export function useMonthlyComparison(
  entries: { date: string; type: 'income' | 'expense' | 'saving'; amount: number }[],
  months: number = 6,
): MonthlyData[] {
  return useMemo(() => {
    const now = new Date()
    const result: MonthlyData[] = []

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      const prefix = `${year}-${String(month).padStart(2, '0')}`

      const monthEntries = entries.filter((e) => e.date.startsWith(prefix))

      const income = monthEntries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
      const expense = monthEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      const saving = monthEntries.filter((e) => e.type === 'saving').reduce((s, e) => s + e.amount, 0)

      result.push({
        month: `${month}월`,
        income,
        expense,
        saving,
      })
    }

    return result
  }, [entries, months])
}
