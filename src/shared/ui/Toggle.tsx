import { TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

type ToggleProps = {
  value: boolean
  onToggle: () => void
  disabled?: boolean
}

export function Toggle({ value, onToggle, disabled }: ToggleProps) {
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(value ? 20 : 0, { duration: 250 }),
      },
    ],
  }))

  return (
    <TouchableOpacity
      className={cn(
        'w-11 h-6 rounded-full justify-center px-0.5',
        value ? 'bg-accent-green' : 'bg-bg-tertiary',
        disabled && 'opacity-50'
      )}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.white,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          },
          thumbStyle,
        ]}
      />
    </TouchableOpacity>
  )
}
