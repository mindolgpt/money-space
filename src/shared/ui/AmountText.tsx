import { Text, type TextProps } from 'react-native'

type AmountTextProps = TextProps & {
  amount: number
  type?: 'income' | 'expense' | 'saving' | 'neutral'
  showSign?: boolean
  locale?: string
}

export function AmountText({ amount, type = 'neutral', showSign = true, locale = 'ko-KR', className = '', style, ...props }: AmountTextProps) {
  const colorMap = {
    income: 'text-emerald-500',
    expense: 'text-red-500',
    saving: 'text-blue-500',
    neutral: 'text-gray-900',
  }

  const prefix = showSign
    ? type === 'income' ? '+'
      : type === 'expense' ? '-'
        : ''
    : ''

  return (
    <Text className={`font-semibold ${colorMap[type]} ${className}`} style={style} {...props}>
      {prefix}₩{amount.toLocaleString(locale)}
    </Text>
  )
}
