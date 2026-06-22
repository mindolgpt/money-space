import { View, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type CardProps = ViewProps & {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined'
  padded?: boolean
}

export function Card({ variant = 'default', padded = true, className = '', style, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-bg-secondary border-border',
    glass: 'bg-bg-glass border-border',
    elevated: 'bg-bg-secondary border-border shadow-md',
    outlined: 'bg-transparent border-border',
  }

  const shadowStyles: Record<string, object> = {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
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
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    outlined: {},
  }

  return (
    <View
      className={cn(
        'rounded-2xl border',
        variants[variant],
        padded && 'p-4',
        className
      )}
      style={[shadowStyles[variant], style]}
      {...props}
    >
      {children}
    </View>
  )
}
