import { View, Text, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type BadgeProps = ViewProps & {
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'yellow' | 'purple' | 'default'
  label: string
  size?: 'sm' | 'md'
}

const colorMap = {
  green: { bg: 'bg-semantic-income/10', text: 'text-semantic-income' },
  red: { bg: 'bg-semantic-expense/10', text: 'text-semantic-expense' },
  blue: { bg: 'bg-semantic-saving/10', text: 'text-semantic-saving' },
  orange: { bg: 'bg-accent-orange/10', text: 'text-accent-orange' },
  yellow: { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow' },
  purple: { bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
  default: { bg: 'bg-bg-tertiary', text: 'text-text-secondary' },
}

const sizeMap = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
}

export function Badge({ variant = 'default', label, size = 'md', className = '', ...props }: BadgeProps) {
  const c = colorMap[variant]
  return (
    <View className={cn('rounded-full flex-row items-center', sizeMap[size], c.bg, className)} {...props}>
      <Text className={cn('font-semibold', size === 'sm' ? 'text-label-sm' : 'text-label-md', c.text)}>{label}</Text>
    </View>
  )
}
