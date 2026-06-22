import { type ReactNode } from 'react'
import { View } from 'react-native'

interface IconProps {
  icon: ReactNode
  size?: number
  color?: string
  className?: string
}

export function Icon({ icon, className = '' }: IconProps) {
  return <View className={className}>{icon}</View>
}

export { ICON_MAP } from './icons'
export type { IconName } from './icons'