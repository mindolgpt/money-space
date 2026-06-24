import { View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { cn } from '@/shared/lib/cn'

type ProgressBarProps = {
  value: number
  max?: number
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const variantClasses = {
  green: 'bg-semantic-income',
  red: 'bg-semantic-expense',
  blue: 'bg-semantic-saving',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'green',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${percentage}%`, { duration: 800 }),
  }))

  return (
    <View className={cn('rounded-full bg-bg-tertiary overflow-hidden', sizeClasses[size], className)}>
      <Animated.View
        className={cn('h-full rounded-full', variantClasses[variant])}
        style={fillStyle}
      />
    </View>
  )
}
