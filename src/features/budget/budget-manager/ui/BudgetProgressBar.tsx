import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { colors } from '@/shared/lib/colors'
import { AlertTriangle, FileText, type LucideIcon } from 'lucide-react-native'
import { ProgressBar, Typography } from '@/shared/ui'

type Props = {
  categoryName: string
  categoryIcon?: LucideIcon
  spent: number
  budget: number
}

export function BudgetProgressBar({
  categoryName,
  categoryIcon,
  spent,
  budget,
}: Props) {
  const percentage = Math.min(Math.round((spent / budget) * 100), 100)
  const isOver = spent > budget
  const remaining = budget - spent

  const opacityAnim = useSharedValue(1)

  useEffect(() => {
    if (isOver) {
      opacityAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 }),
        ),
        -1,
      )
    } else {
      opacityAnim.value = 1
    }
  }, [isOver, opacityAnim])

  const containerAnim = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
  }))

  const barVariant = isOver ? 'red' : percentage >= 80 ? 'orange' : 'green'

  return (
    <View>
      <Animated.View style={containerAnim}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            {(() => {
              const IconComponent = categoryIcon || FileText
              return <IconComponent size={16} color={colors.textTertiary} className="mr-1.5" />
            })()}
            <Typography variant="label-md" color="primary" className="ml-1.5">
              {categoryName}
            </Typography>
            {isOver && (
              <AlertTriangle size={12} color={colors.accentRed} className="ml-1.5" />
            )}
          </View>
          <Typography variant="label-sm" color={isOver ? 'expense' : 'secondary'}>
            {spent.toLocaleString()} / {budget.toLocaleString()}원
          </Typography>
        </View>
        <ProgressBar value={percentage} variant={barVariant} size="sm" />
        <View className="flex-row justify-between mt-1.5">
          <Typography variant="label-sm" color={isOver ? 'expense' : 'tertiary'}>
            {percentage}% 사용
          </Typography>
          <Typography variant="label-sm" color="tertiary">
            {isOver
              ? `초과 ${Math.abs(remaining).toLocaleString()}원`
              : `남은 ${remaining.toLocaleString()}원`}
          </Typography>
        </View>
      </Animated.View>
    </View>
  )
}
