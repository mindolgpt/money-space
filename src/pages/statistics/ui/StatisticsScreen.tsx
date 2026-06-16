import { ScrollView } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'
import { MonthlySummary } from '@/widgets/monthly-summary'
import { CategoryChart } from '@/widgets/category-chart'

export function StatisticsScreen() {
  const { user } = useAuthStore()
  const now = new Date()
  const { data: entries = [] } = useEntries(
    user?.id ?? '',
    now.getFullYear(),
    now.getMonth() + 1,
  )

  const income = entries
    .filter((e) => e.type === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const expense = entries
    .filter((e) => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <MonthlySummary
        year={now.getFullYear()}
        month={now.getMonth() + 1}
        income={income}
        expense={expense}
      />
      <CategoryChart entries={entries} type="expense" />
      <CategoryChart entries={entries} type="income" />
    </ScrollView>
  )
}
