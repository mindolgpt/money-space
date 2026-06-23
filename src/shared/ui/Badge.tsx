import { View, Text, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type BadgeProps = ViewProps & {
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'yellow' | 'purple' | 'default'
  label: string
}

const colorMap = {
  green: { bg: 'bg-semantic-income/15', text: 'text-semantic-income' },
  red: { bg: 'bg-semantic-expense/15', text: 'text-semantic-expense' },
  blue: { bg: 'bg-semantic-saving/15', text: 'text-semantic-saving' },
  orange: { bg: 'bg-accent-orange/15', text: 'text-accent-orange' },
  yellow: { bg: 'bg-accent-yellow/15', text: 'text-accent-yellow' },
  purple: { bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
  default: { bg: 'bg-bg-tertiary', text: 'text-text-secondary' },
}

export function Badge({ variant = 'default', label, className = '', ...props }: BadgeProps) {
  const c = colorMap[variant]
  return (
    <View className={cn('px-3 py-1 rounded-full', c.bg, className)} {...props}>
      <Text className={cn('text-xs font-semibold', c.text)}>{label}</Text>
    </View>
  )
}
