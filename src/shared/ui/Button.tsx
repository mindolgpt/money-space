import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type ButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-text-text-primary active:opacity-90',
    secondary: 'bg-bg-tertiary active:opacity-80',
    ghost: 'bg-transparent active:bg-bg-tertiary',
    danger: 'bg-semantic-expense/15 active:opacity-80',
    outline: 'bg-transparent border border-border active:bg-bg-tertiary',
  }

  const textVariantClasses = {
    primary: 'text-text-inverse',
    secondary: 'text-text-primary',
    ghost: 'text-text-primary',
    danger: 'text-semantic-expense',
    outline: 'text-text-primary',
  }

  const sizeClasses = {
    sm: 'py-2 px-4 rounded-lg',
    md: 'py-3.5 px-6 rounded-xl',
    lg: 'py-4 px-8 rounded-xl',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? '#FF3B30' : '#1D1D1F'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text className={cn('font-semibold', textVariantClasses[variant], textSizeClasses[size], icon && 'ml-2')}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
