import { type LucideIcon } from 'lucide-react-native'
import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

type CategoryPillProps = TouchableOpacityProps & {
  icon?: LucideIcon
  emoji?: string
  label: string
  active?: boolean
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

const variantActiveBg: Record<string, string> = {
  green: 'bg-accent-green',
  red: 'bg-semantic-expense',
  blue: 'bg-semantic-saving',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
  gray: 'bg-text-primary',
}

const variantInactiveBg: Record<string, string> = {
  green: 'bg-semantic-income/10',
  red: 'bg-semantic-expense/10',
  blue: 'bg-semantic-saving/10',
  orange: 'bg-accent-orange/10',
  purple: 'bg-accent-purple/10',
  gray: 'bg-bg-tertiary',
}

const variantInactiveText: Record<string, string> = {
  green: 'text-semantic-income',
  red: 'text-semantic-expense',
  blue: 'text-semantic-saving',
  orange: 'text-accent-orange',
  purple: 'text-accent-purple',
  gray: 'text-text-secondary',
}

const sizeClasses = {
  sm: { container: 'px-2.5 py-1.5 gap-1', icon: 12, text: 'text-label-sm' },
  md: { container: 'px-3 py-2 gap-1.5', icon: 16, text: 'text-label-md' },
  lg: { container: 'p-3 gap-2', icon: 20, text: 'text-body-md' },
}

export function CategoryPill({
  icon: IconComponent,
  emoji,
  label,
  active = false,
  variant = 'gray',
  size = 'md',
  className,
  ...props
}: CategoryPillProps) {
  const s = sizeClasses[size]

  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center rounded-full',
        s.container,
        active ? variantActiveBg[variant] : variantInactiveBg[variant],
        className,
      )}
      activeOpacity={0.7}
      {...props}
    >
      {IconComponent && (
        <IconComponent
          size={s.icon}
          color={active ? colors.white : (variant === 'green' ? colors.accentGreen : variant === 'red' ? colors.accentRed : variant === 'blue' ? colors.semanticSaving : variant === 'orange' ? colors.accentOrange : variant === 'purple' ? colors.accentPurple : colors.textTertiary)}
          strokeWidth={active ? 2.5 : 2}
        />
      )}
      {!IconComponent && emoji && (
        <Text className={cn(s.text, active ? 'text-white' : '')}>{emoji}</Text>
      )}
      <Text
        className={cn(
          'font-medium',
          s.text,
          active ? 'text-white' : variantInactiveText[variant],
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
