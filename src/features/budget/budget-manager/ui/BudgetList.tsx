import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useState } from 'react'
import { createCategoryApi } from '@/entities/category'
import { useBudgets, useUpsertBudget } from '@/entities/budget'
import { BudgetProgress } from '@/widgets/budget-progress'

export function BudgetList() {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { data: budgets = [] } = useBudgets(month)
  const { mutate: upsertBudget } = useUpsertBudget()
  const [categories] = useState<any[]>(() => {
    const categoryApi = createCategoryApi()
    return categoryApi.getByType('expense')
  })
  const [editingAmounts, setEditingAmounts] = useState<Record<string, string>>(
    {},
  )

  const getSpent = (categoryId: string) => {
    // TODO: calculate from actual entries
    return 0
  }

  const handleSetBudget = (categoryId: string) => {
    const amount = parseInt(editingAmounts[categoryId] || '0', 10)
    if (!amount) return
    upsertBudget({
      id: `${month}-${categoryId}`,
      categoryId,
      amount,
      month,
    })
  }

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-4">예산 관리</Text>
      {categories.length === 0 && (
        <Text className="text-gray-400">카테고리가 없습니다</Text>
      )}
      {categories.map((cat) => {
        const budget = budgets.find((b) => b.categoryId === cat.id)
        const amountStr =
          editingAmounts[cat.id] ?? budget?.amount.toString() ?? ''

        return (
          <View key={cat.id} className="mb-4 p-3 bg-white rounded-lg">
            <Text className="text-gray-700 font-medium mb-1">
              {cat.icon} {cat.name}
            </Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
                placeholder="예산 금액"
                keyboardType="numeric"
                value={amountStr}
                onChangeText={(v) =>
                  setEditingAmounts((prev) => ({ ...prev, [cat.id]: v }))
                }
              />
              <TouchableOpacity
                className="bg-blue-500 rounded-lg px-4 py-2"
                onPress={() => handleSetBudget(cat.id)}
              >
                <Text className="text-white text-sm">설정</Text>
              </TouchableOpacity>
            </View>
            {budget && (
              <BudgetProgress
                categoryName={cat.name}
                spent={getSpent(cat.id)}
                budget={budget.amount}
              />
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}
