import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

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
    primary: 'bg-accent-green active:opacity-90',
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
    sm: 'py-2 px-4 rounded-md',
    md: 'py-3.5 px-6 rounded-lg',
    lg: 'py-4 px-8 rounded-lg',
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
          color={variant === 'primary' ? colors.white : variant === 'danger' ? colors.accentRed : colors.textPrimary}
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
