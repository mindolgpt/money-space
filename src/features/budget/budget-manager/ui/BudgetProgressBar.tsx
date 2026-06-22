import { View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { AlertTriangle, FileText, type LucideIcon } from 'lucide-react-native'

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
  const progressAnim = useSharedValue(0)

  useEffect(() => {
    progressAnim.value = withTiming(Math.min(percentage, 100), { duration: 500 })

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
  }, [percentage, isOver, opacityAnim, progressAnim])

  const barAnim = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }))

  const containerAnim = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
  }))

  const getProgressColor = () => {
    if (isOver) return 'bg-accent-red'
    if (percentage >= 80) return 'bg-accent-orange'
    if (percentage >= 50) return 'bg-accent-yellow'
    return 'bg-accent-green'
  }

  return (
    <View>
      <Animated.View style={containerAnim}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            {(() => {
              const IconComponent = categoryIcon || FileText
              return <IconComponent size={16} color="#86868B" className="mr-1.5" />
            })()}
            <Text className="text-sm font-medium text-text-primary">
              {categoryName}
            </Text>
            {isOver && (
              <AlertTriangle size={12} className="ml-1.5 text-accent-red" />
            )}
          </View>
          <Text
            className={`text-sm ${isOver ? 'text-accent-red' : 'text-text-secondary'}`}
          >
            {spent.toLocaleString()} / {budget.toLocaleString()}원
          </Text>
        </View>
        <View className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <Animated.View
            style={barAnim}
            className={`h-full rounded-full ${getProgressColor()}`}
          />
        </View>
        <View className="flex-row justify-between mt-1.5">
          <Text className={`text-xs ${isOver ? 'text-accent-red' : 'text-text-tertiary'}`}>
            {percentage}% 사용
          </Text>
          <Text className="text-xs text-text-tertiary">
            {isOver
              ? `초과 ${Math.abs(remaining).toLocaleString()}원`
              : `남은 ${remaining.toLocaleString()}원`}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}
