import { Text, type TextProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type TypographyVariant = 'headline-xl' | 'headline-lg' | 'headline-md' | 'body-lg' | 'body-md' | 'label-md' | 'label-sm' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
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
  'headline-xl': 'text-headline-xl',
  'headline-lg': 'text-headline-lg',
  'headline-md': 'text-headline-md',
  'body-lg': 'text-body-lg',
  'body-md': 'text-body-md',
  'label-md': 'text-label-md',
  'label-sm': 'text-label-sm',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
}

const variantStyles: Record<string, object> = {
  'headline-xl': { letterSpacing: -0.72 },
  'headline-lg': { letterSpacing: -0.24 },
  'label-md': { letterSpacing: 0.14 },
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
  accent: 'text-accent-green',
  income: 'text-semantic-income',
  expense: 'text-semantic-expense',
  saving: 'text-semantic-saving',
}

export function Typography({
  variant = 'body-md',
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
      style={[variantStyles[variant], style]}
      {...props}
    >
      {children}
    </Text>
  )
}

export type { TypographyVariant, TypographyWeight, TypographyColor }
