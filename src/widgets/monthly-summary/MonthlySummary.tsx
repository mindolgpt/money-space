import { View, Text } from 'react-native'
import { Card, AmountText } from '@/shared/ui'

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
        <Text className="text-sm font-semibold text-gray-900 text-center mb-4">
          {year}년 {month}월 요약
        </Text>
        <View className="flex-row">
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-lg bg-emerald-50 items-center justify-center mb-1.5">
              <Text className="text-sm">↑</Text>
            </View>
            <Text className="text-xs text-gray-400 mb-1">수입</Text>
            <AmountText amount={income} type="income" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center mb-1.5">
              <Text className="text-sm">↓</Text>
            </View>
            <Text className="text-xs text-gray-400 mb-1">지출</Text>
            <AmountText amount={expense} type="expense" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-lg bg-purple-50 items-center justify-center mb-1.5">
              <Text className="text-sm">🏦</Text>
            </View>
            <Text className="text-xs text-gray-400 mb-1">저축</Text>
            <AmountText amount={saving} type="saving" className="text-sm" showSign={false} />
          </View>
          <View className="flex-1 items-center">
            <View className="w-9 h-9 rounded-lg bg-blue-50 items-center justify-center mb-1.5">
              <Text className="text-sm">💰</Text>
            </View>
            <Text className="text-xs text-gray-400 mb-1">잔액</Text>
            <Text className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  )
}
