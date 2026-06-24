import { useState } from 'react'
import { View, Text, TextInput, type TextInputProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

type InputProps = TextInputProps & {
  variant?: 'underline' | 'box'
  label?: string
  error?: string
  hint?: string
  rightElement?: React.ReactNode
  containerClassName?: string
}

export function Input({
  variant = 'box',
  label,
  error,
  hint,
  rightElement,
  containerClassName,
  className,
  onFocus,
  onBlur,
  value,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e as any)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e as any)
  }

  const hasValue = typeof value === 'string' ? value.length > 0 : !!value

  if (variant === 'underline') {
    return (
      <View className={cn('mb-4', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-1.5">
            {label}
          </Text>
        )}
        <View
          className={cn(
            'flex-row items-center border-b py-3',
            error
              ? 'border-semantic-expense'
              : isFocused
                ? 'border-accent-green'
                : 'border-border',
          )}
        >
          <TextInput
            className={cn('flex-1 text-body-md text-text-primary font-medium', className)}
            placeholderTextColor={colors.textTertiary}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightElement}
        </View>
        {error && <Text className="text-label-sm text-semantic-expense mt-1">{error}</Text>}
        {hint && !error && <Text className="text-label-sm text-text-tertiary mt-1">{hint}</Text>}
      </View>
    )
  }

  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-2">
          {label}
        </Text>
      )}
      <View
        className={cn(
          'flex-row items-center rounded-lg border px-4 py-3.5',
          error
            ? 'border-semantic-expense bg-bg-tertiary'
            : isFocused
              ? 'border-accent-green bg-bg-elevated'
              : hasValue
                ? 'border-border bg-bg-tertiary'
                : 'border-border bg-bg-tertiary',
        )}
      >
        <TextInput
          className={cn('flex-1 text-body-md text-text-primary font-medium', className)}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightElement}
      </View>
      {error && <Text className="text-label-sm text-semantic-expense mt-1">{error}</Text>}
      {hint && !error && <Text className="text-label-sm text-text-tertiary mt-1">{hint}</Text>}
    </View>
  )
}
