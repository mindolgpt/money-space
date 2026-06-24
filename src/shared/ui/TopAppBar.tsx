import { View, Text, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type TopAppBarProps = ViewProps & {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  elevated?: boolean
  transparent?: boolean
}

export function TopAppBar({
  title,
  subtitle,
  leading,
  trailing,
  elevated = true,
  transparent = false,
  className,
  style,
  ...props
}: TopAppBarProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-5 h-16',
        transparent ? 'bg-transparent' : 'bg-bg-secondary',
        !transparent && 'border-b border-border',
        className,
      )}
      style={[
        elevated && !transparent
          ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 12,
              elevation: 2,
            }
          : undefined,
        style,
      ]}
      {...props}
    >
      <View className="flex-row items-center flex-1">
        {leading && <View className="mr-3">{leading}</View>}
        <View className="flex-1">
          <Text
            className="text-body-lg font-bold text-text-primary"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-label-sm text-text-tertiary" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {trailing && <View className="flex-row items-center gap-3">{trailing}</View>}
    </View>
  )
}
