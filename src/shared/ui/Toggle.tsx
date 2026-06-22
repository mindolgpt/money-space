import { TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { cn } from '@/shared/lib/cn'

type ToggleProps = {
  value: boolean
  onToggle: () => void
  disabled?: boolean
}

export function Toggle({ value, onToggle, disabled }: ToggleProps) {
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(value ? 20 : 0, {
          duration: 250,
        }),
      },
    ],
  }))

  return (
    <TouchableOpacity
      className={cn(
        'w-[51px] h-[31px] rounded-full justify-center px-[2px]',
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
            width: 27,
            height: 27,
            borderRadius: 14,
            backgroundColor: '#FFFFFF',
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
