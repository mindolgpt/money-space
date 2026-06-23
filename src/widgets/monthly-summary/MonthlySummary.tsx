import { View, Text } from 'react-native'
import { ArrowUp, ArrowDown, Building2, Wallet } from 'lucide-react-native'
import { Card, AmountText } from '@/shared/ui'
import { colors } from '@/shared/lib/colors'

type Props = {
  year: number
  month: number
  income: number
  expense: number
  saving?: number
}

export function MonthlySummary({ year, month, income, expense, saving = 0 }: Props) {
  const balance = income - expense - saving

  return (
    <View className="px-4 mb-3">
      <Card>
        <Text className="text-sm font-semibold text-text-primary text-center mb-4">
          {year}년 {month}월 요약
        </Text>
        <View className="flex-row">
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-md bg-semantic-income/10 items-center justify-center mb-1.5">
              <ArrowUp size={16} color={colors.accentGreen} />
            </View>
            <Text className="text-xs text-text-secondary mb-1">수입</Text>
            <AmountText amount={income} type="income" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-md bg-semantic-expense/10 items-center justify-center mb-1.5">
              <ArrowDown size={16} color={colors.accentRed} />
            </View>
            <Text className="text-xs text-text-secondary mb-1">지출</Text>
            <AmountText amount={expense} type="expense" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-md bg-accent-purple/10 items-center justify-center mb-1.5">
              <Building2 size={16} color={colors.accentPurple} />
            </View>
            <Text className="text-xs text-text-secondary mb-1">저축</Text>
            <AmountText amount={saving} type="saving" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-md bg-semantic-saving/10 items-center justify-center mb-1.5">
              <Wallet size={16} color={colors.accentGreen} />
            </View>
            <Text className="text-xs text-text-secondary mb-1">잔액</Text>
            <Text className={`text-sm font-bold ${balance >= 0 ? 'text-semantic-income' : 'text-semantic-expense'}`}>
              {balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  )
}
