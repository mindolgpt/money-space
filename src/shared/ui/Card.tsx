import { View, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type CardProps = ViewProps & {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined'
  padded?: boolean
  hoverable?: boolean
}

export function Card({ variant = 'default', padded = true, hoverable = false, className = '', style, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-bg-secondary border-border',
    glass: 'bg-bg-glass border-border',
    elevated: 'bg-bg-secondary border-border',
    outlined: 'bg-transparent border-border',
  }

  const shadowStyles: Record<string, object> = {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 12,
      elevation: 1,
    },
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 32,
      elevation: 3,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 12,
      elevation: 3,
    },
    outlined: {},
  }

  return (
    <View
      className={cn(
        'rounded-xl border',
        variants[variant],
        padded && 'p-4',
        hoverable && 'active:shadow-md',
        className
      )}
      style={[shadowStyles[variant], style]}
      {...props}
    >
      {children}
    </View>
  )
}
