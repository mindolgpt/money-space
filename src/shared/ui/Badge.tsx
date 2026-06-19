import { View, Text, type ViewProps } from 'react-native'

type BadgeProps = ViewProps & {
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'yellow' | 'purple' | 'default'
  label: string
}

const colorMap = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  red: { bg: 'bg-red-50', text: 'text-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-500' },
  default: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

export function Badge({ variant = 'default', label, className = '', ...props }: BadgeProps) {
  const colors = colorMap[variant]
  return (
    <View className={`px-2.5 py-1 rounded-full ${colors.bg} ${className}`} {...props}>
      <Text className={`text-xs font-medium ${colors.text}`}>{label}</Text>
    </View>
  )
}
