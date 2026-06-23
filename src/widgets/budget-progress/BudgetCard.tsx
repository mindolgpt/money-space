import { View, Text, TouchableOpacity, Alert } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { FileText } from 'lucide-react-native'
import type { Budget } from '@/entities/budget'
import { useDeleteBudget, BUDGET_KEYS } from '@/entities/budget'
import { BudgetProgress } from '@/widgets/budget-progress/BudgetProgress'
import { colors } from '@/shared/lib/colors'

type Props = {
  budget: Budget
  categoryName: string
  categoryIcon?: string
  spent: number
  onEdit?: () => void
}

export function BudgetCard({
  budget,
  categoryName,
  spent,
  onEdit,
}: Props) {
  const queryClient = useQueryClient()
  const deleteBudget = useDeleteBudget()
  const [showActions, setShowActions] = useState(false)

  const translateX = useSharedValue(0)

  const handleSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowActions(true)
    translateX.value = withTiming(-80, { duration: 200 })
  }

  const handleSwipeRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowActions(false)
    translateX.value = withTiming(0, { duration: 200 })
  }

  const handleDelete = () => {
    Alert.alert(
      '예산 삭제',
      '이 예산을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel', onPress: () => handleSwipeRight() },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteBudget.mutateAsync(budget.id)
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            handleSwipeRight()
          },
        },
      ],
    )
  }

  const handlePress = () => {
    if (showActions) {
      handleSwipeRight()
    } else if (onEdit) {
      onEdit()
    }
  }

  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View className="mb-3">
      <View className="absolute right-0 top-0 bottom-0 justify-center px-2">
        <TouchableOpacity
          className="bg-accent-red px-4 py-6 rounded-r-xl h-full justify-center"
          onPress={handleDelete}
        >
          <Text className="text-white text-sm font-medium">삭제</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={cardAnim}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          onLongPress={handleSwipeLeft}
          className="card p-4"
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <FileText size={16} color={colors.textTertiary} className="mr-2" />
              <Text className="font-medium text-text-primary">{categoryName}</Text>
            </View>
            <Text className="text-xs text-text-secondary">
              {budget.amount.toLocaleString()}원
            </Text>
          </View>

          <BudgetProgress
            categoryName={categoryName}
            spent={spent}
            budget={budget.amount}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
