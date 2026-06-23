import { type LucideIcon } from 'lucide-react-native'
import { View, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/lib/theme-provider'
import { colors } from '@/shared/lib/colors'

type IconCircleProps = ViewProps & {
  icon: LucideIcon
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  iconSize?: number
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 14 },
  md: { container: 'w-10 h-10', icon: 18 },
  lg: { container: 'w-14 h-14', icon: 24 },
}

const variantBgMap = {
  green: 'bg-semantic-income/10',
  red: 'bg-semantic-expense/10',
  blue: 'bg-semantic-saving/10',
  orange: 'bg-accent-orange/10',
  purple: 'bg-accent-purple/10',
  gray: 'bg-bg-tertiary',
}

const variantIconColorMapLight: Record<string, string> = {
  green: colors.accentGreen,
  red: colors.accentRed,
  blue: colors.accentBlue,
  orange: colors.accentOrange,
  purple: colors.accentPurple,
  gray: colors.textTertiary,
}

const variantIconColorMapDark: Record<string, string> = {
  green: colors.accentGreen,
  red: colors.accentRed,
  blue: colors.accentBlue,
  orange: colors.accentOrange,
  purple: colors.accentPurple,
  gray: colors.textTertiary,
}

export function IconCircle({ icon: IconComponent, variant = 'gray', size = 'md', iconSize, className = '', ...props }: IconCircleProps) {
  const { isDark } = useThemeStore()
  const s = sizeMap[size]
  const bg = variantBgMap[variant]
  const iconColor = isDark ? variantIconColorMapDark[variant] : variantIconColorMapLight[variant]

  return (
      <View className={cn(s.container, 'rounded-full items-center justify-center', bg, className)} {...props}>
      <IconComponent size={iconSize ?? s.icon} color={iconColor} />
    </View>
  )
}
