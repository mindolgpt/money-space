import { View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import type { Budget } from '@/entities/budget'
import type { Category } from '@/entities/category'

type Props = {
  budget: Budget | null
  actualSpent: number
  category?: Category
}

export function BudgetVsActual({ budget, actualSpent, category }: Props) {
  const budgetAmount = budget?.amount ?? 0
  const remaining = budgetAmount - actualSpent
  const percent = budgetAmount > 0 ? Math.min((actualSpent / budgetAmount) * 100, 100) : 0
  const isOverBudget = actualSpent > budgetAmount && budgetAmount > 0

  const progressAnim = useSharedValue(0)
  const opacityAnim = useSharedValue(1)

  useEffect(() => {
    progressAnim.value = withTiming(percent, { duration: 500 })

    if (isOverBudget) {
      opacityAnim.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
      )
    } else {
      opacityAnim.value = 1
    }
  }, [percent, isOverBudget, opacityAnim, progressAnim])

  const barAnim = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }))

  const containerAnim = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
  }))

  if (!budget || budgetAmount === 0) {
    return (
      <View className="card p-4 mx-4 mt-4">
        <Text className="text-base font-semibold text-primary mb-2">
          예산 대비 지출
        </Text>
        <View className="py-6 items-center">
          <Text className="text-tertiary text-sm">
            설정된 예산이 없습니다
          </Text>
        </View>
      </View>
    )
  }

  return (
    <Animated.View style={containerAnim} className="card p-4 mx-4 mt-4">
      <Text className="text-base font-semibold text-primary mb-2">
        예산 대비 지출 {category && `(${category.icon || ''} ${category.name})`}
      </Text>

      <View className="flex-row justify-between mb-2">
        <View>
          <Text className="text-xs text-secondary">예산</Text>
          <Text className="text-sm font-medium text-primary">
            {budgetAmount.toLocaleString()}원
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-secondary">지출</Text>
          <Text className={`text-sm font-medium ${isOverBudget ? 'text-accent-red' : 'text-primary'}`}>
            {actualSpent.toLocaleString()}원
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-secondary">남은 금액</Text>
          <Text className={`text-sm font-medium ${isOverBudget ? 'text-accent-red' : 'text-accent-green'}`}>
            {isOverBudget ? `초과 ${Math.abs(remaining).toLocaleString()}` : `${remaining.toLocaleString()}원`}
          </Text>
        </View>
      </View>

      <View className="h-3 bg-bg-tertiary rounded-full overflow-hidden mb-2">
        <Animated.View
          style={[barAnim, { backgroundColor: isOverBudget ? '#FF453A' : percent >= 80 ? '#FF9F0A' : percent >= 50 ? '#FFD60A' : '#30D158' }]}
          className="h-full rounded-full"
        />
      </View>

      <View className="flex-row justify-between">
        <Text className={`text-xs ${isOverBudget ? 'text-accent-red' : 'text-tertiary'}`}>
          {Math.round(percent)}% 사용
        </Text>
        {isOverBudget && (
          <Text className="text-xs text-accent-red font-medium">
            ⚠️ 예산 초과
          </Text>
        )}
      </View>
    </Animated.View>
  )
}