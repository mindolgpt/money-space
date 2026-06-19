import { View, type ViewProps } from 'react-native'

type CardProps = ViewProps & {
  variant?: 'default' | 'glass' | 'elevated'
  padded?: boolean
}

export function Card({ variant = 'default', padded = true, className = '', style, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-[rgba(0,0,0,0.06)]',
    glass: 'bg-white/70 border border-[rgba(0,0,0,0.06)]',
    elevated: 'bg-white border border-[rgba(0,0,0,0.06)]',
  }

  return (
    <View
      className={`rounded-2xl ${variants[variant]} ${padded ? 'p-4' : ''} ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: variant === 'elevated' ? 4 : 2 },
          shadowOpacity: variant === 'elevated' ? 0.08 : 0.04,
          shadowRadius: variant === 'elevated' ? 16 : 8,
          elevation: variant === 'elevated' ? 4 : 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
