import { Text, type TextProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

type AmountTextProps = TextProps & {
  amount: number
  type?: 'income' | 'expense' | 'saving' | 'neutral'
  showSign?: boolean
  locale?: string
}

export function AmountText({ amount, type = 'neutral', showSign = true, locale = 'ko-KR', className = '', style, ...props }: AmountTextProps) {
  const colorMap = {
    income: 'text-semantic-income',
    expense: 'text-semantic-expense',
    saving: 'text-semantic-saving',
    neutral: 'text-text-primary',
  }

  const prefix = showSign
    ? type === 'income' ? '+'
      : type === 'expense' ? '-'
        : ''
    : ''

  return (
    <Text className={cn('font-medium tabular-nums', colorMap[type], className)} style={style} {...props}>
      {prefix}₩{amount.toLocaleString(locale)}
    </Text>
  )
}
