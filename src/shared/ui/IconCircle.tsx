import { type LucideIcon } from 'lucide-react-native'
import { View, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/lib/theme-provider'

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
  green: '#34C759',
  red: '#FF3B30',
  blue: '#007AFF',
  orange: '#FF9500',
  purple: '#AF52DE',
  gray: '#86868B',
}

const variantIconColorMapDark: Record<string, string> = {
  green: '#30D158',
  red: '#FF453A',
  blue: '#0A84FF',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  gray: 'rgba(255,255,255,0.55)',
}

export function IconCircle({ icon: IconComponent, variant = 'gray', size = 'md', iconSize, className = '', ...props }: IconCircleProps) {
  const { isDark } = useThemeStore()
  const s = sizeMap[size]
  const bg = variantBgMap[variant]
  const iconColor = isDark ? variantIconColorMapDark[variant] : variantIconColorMapLight[variant]

  return (
    <View className={cn(s.container, 'rounded-xl items-center justify-center', bg, className)} {...props}>
      <IconComponent size={iconSize ?? s.icon} color={iconColor} />
    </View>
  )
}
