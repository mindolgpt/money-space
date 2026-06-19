import { View, Text } from 'react-native'

type IconCircleProps = {
  icon: string
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'text-sm' },
  md: { container: 'w-10 h-10', icon: 'text-base' },
  lg: { container: 'w-14 h-14', icon: 'text-2xl' },
}

const colorMap = {
  green: 'bg-emerald-50',
  red: 'bg-red-50',
  blue: 'bg-blue-50',
  orange: 'bg-orange-50',
  purple: 'bg-purple-50',
  gray: 'bg-gray-100',
}

export function IconCircle({ icon, variant = 'gray', size = 'md' }: IconCircleProps) {
  const s = sizeMap[size]
  return (
    <View className={`${s.container} rounded-xl ${colorMap[variant]} items-center justify-center`}>
      <Text className={s.icon}>{icon}</Text>
    </View>
  )
}
