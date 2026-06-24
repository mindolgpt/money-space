import { View, Text } from 'react-native'
import { AlertTriangle } from 'lucide-react-native'
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
import { colors } from '@/shared/lib/colors'
import { Card, Typography } from '@/shared/ui'

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
      <View className="px-4 mt-4 mb-4">
        <Card>
          <Typography variant="body-lg" weight="semibold" className="mb-2">
            예산 대비 지출
          </Typography>
          <View className="py-6 items-center">
            <Typography variant="label-md" color="tertiary">
              설정된 예산이 없습니다
            </Typography>
          </View>
        </Card>
      </View>
    )
  }

  const getBarColor = () => {
    if (isOverBudget) return colors.accentRed
    if (percent >= 80) return colors.accentOrange
    if (percent >= 50) return colors.accentYellow
    return colors.accentGreen
  }

  return (
    <View className="px-4 mt-4 mb-4">
      <Animated.View style={containerAnim}>
        <Card className="overflow-hidden">
          <Typography variant="body-lg" weight="semibold" className="mb-2">
            예산 대비 지출 {category && `(${category.icon || ''} ${category.name})`}
          </Typography>

          <View className="flex-row justify-between mb-2">
            <View>
              <Typography variant="label-sm" color="secondary">예산</Typography>
              <Typography variant="label-md" weight="medium">
                {budgetAmount.toLocaleString()}원
              </Typography>
            </View>
            <View className="items-center">
              <Typography variant="label-sm" color="secondary">지출</Typography>
              <Typography variant="label-md" weight="medium" color={isOverBudget ? 'expense' : 'primary'}>
                {actualSpent.toLocaleString()}원
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="label-sm" color="secondary">남은 금액</Typography>
              <Typography variant="label-md" weight="medium" color={isOverBudget ? 'expense' : 'income'}>
                {isOverBudget ? `초과 ${Math.abs(remaining).toLocaleString()}` : `${remaining.toLocaleString()}원`}
              </Typography>
            </View>
          </View>

          <View className="h-3 bg-bg-tertiary rounded-full overflow-hidden mb-2">
            <Animated.View
              style={[barAnim, { backgroundColor: getBarColor() }]}
              className="h-full rounded-full"
            />
          </View>

          <View className="flex-row justify-between">
            <Typography variant="label-sm" color={isOverBudget ? 'expense' : 'tertiary'}>
              {Math.round(percent)}% 사용
            </Typography>
            {isOverBudget && (
              <View className="flex-row items-center">
                <AlertTriangle size={12} color={colors.accentRed} />
                <Text className="text-label-sm text-semantic-expense font-medium ml-1">예산 초과</Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    </View>
  )
}