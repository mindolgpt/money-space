import { X } from 'lucide-react-native'
import { View, Text, TouchableOpacity, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

type ChipProps = ViewProps & {
  label: string
  variant?: 'filled' | 'outlined' | 'tinted'
  color?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
  size?: 'sm' | 'md'
  removable?: boolean
  onRemove?: () => void
  onPress?: () => void
  icon?: React.ReactNode
}

const tintedBg: Record<string, string> = {
  green: 'bg-semantic-income/10',
  red: 'bg-semantic-expense/10',
  blue: 'bg-semantic-saving/10',
  orange: 'bg-accent-orange/10',
  purple: 'bg-accent-purple/10',
  gray: 'bg-bg-tertiary',
}

const tintedText: Record<string, string> = {
  green: 'text-semantic-income',
  red: 'text-semantic-expense',
  blue: 'text-semantic-saving',
  orange: 'text-accent-orange',
  purple: 'text-accent-purple',
  gray: 'text-text-secondary',
}

const filledBg: Record<string, string> = {
  green: 'bg-accent-green',
  red: 'bg-semantic-expense',
  blue: 'bg-semantic-saving',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
  gray: 'bg-text-primary',
}

const outlinedBorder: Record<string, string> = {
  green: 'border-semantic-income',
  red: 'border-semantic-expense',
  blue: 'border-semantic-saving',
  orange: 'border-accent-orange',
  purple: 'border-accent-purple',
  gray: 'border-border',
}

const sizeClasses = {
  sm: { container: 'px-2 py-0.5', text: 'text-label-sm', icon: 12 },
  md: { container: 'px-3 py-1', text: 'text-label-md', icon: 14 },
}

export function Chip({
  label,
  variant = 'tinted',
  color = 'gray',
  size = 'md',
  removable = false,
  onRemove,
  onPress,
  icon,
  className,
  ...props
}: ChipProps) {
  const s = sizeClasses[size]

  const containerClass = cn(
    'flex-row items-center rounded-full',
    s.container,
    variant === 'filled' && filledBg[color],
    variant === 'tinted' && tintedBg[color],
    variant === 'outlined' && 'bg-transparent border',
    variant === 'outlined' && outlinedBorder[color],
    className,
  )

  const textClass = cn(
    'font-medium',
    s.text,
    variant === 'filled' && 'text-white',
    variant === 'tinted' && tintedText[color],
    variant === 'outlined' && tintedText[color],
  )

  const content = (
    <View className={containerClass} {...props}>
      {icon}
      <Text className={cn(textClass, icon && 'ml-1')}>{label}</Text>
      {removable && (
        <TouchableOpacity
          className="ml-1 rounded-full items-center justify-center"
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={s.icon} color={variant === 'filled' ? colors.white : colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}
