import { Text, type TextProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type TypographyVariant = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold'
type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'accent' | 'income' | 'expense' | 'saving'

interface TypographyProps extends TextProps {
  variant?: TypographyVariant
  weight?: TypographyWeight
  color?: TypographyColor
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<TypographyVariant, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
}

const weightClasses: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const colorClasses: Record<TypographyColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  muted: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  accent: 'text-accent-blue',
  income: 'text-semantic-income',
  expense: 'text-semantic-expense',
  saving: 'text-semantic-saving',
}

export function Typography({
  variant = 'base',
  weight = 'normal',
  color = 'primary',
  className = '',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      className={cn(
        variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Text>
  )
}

export type { TypographyVariant, TypographyWeight, TypographyColor }