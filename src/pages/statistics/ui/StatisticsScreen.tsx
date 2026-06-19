import { ScrollView, View, Text, TouchableOpacity, Share, Alert } from 'react-native'
import { useState, useMemo } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'
import { useCategories } from '@/entities/category'
import { useBudgets, createBudgetApi } from '@/entities/budget'
import { CategoryChart } from '@/widgets/category-chart'
import { PieChart } from '@/widgets/pie-chart'
import { BudgetVsActual } from '@/widgets/budget-vs-actual'
import { MonthlyComparisonChart, useMonthlyComparison } from '@/widgets/monthly-comparison'
import { PeriodSelector, getPeriodDisplayLabel, getDateRangeForPeriod, type PeriodType } from '@/widgets/period-selector'
import { exportToPdf } from '@/shared/lib/export-helper'
import { Card, AmountText } from '@/shared/ui'

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export function StatisticsScreen() {
  const { user } = useAuthStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const currentDate = useMemo(() => new Date(year, month - 1, 1), [year, month])

  const { data: entries = [] } = useEntries(user?.id ?? '', year, month)
  const { data: categories = [] } = useCategories()
  const { data: budgets = [] } = useBudgets(user?.id ?? '', `${year}-${String(month).padStart(2, '0')}`)

  const filteredEntries = useMemo(() => {
    const { start, end } = getDateRangeForPeriod(periodType, currentDate)
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= start && entryDate <= end
    })
  }, [entries, periodType, currentDate])

  const monthlyComparisonData = useMonthlyComparison(entries, 6)

  const income = filteredEntries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = filteredEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const saving = filteredEntries.filter((e) => e.type === 'saving').reduce((s, e) => s + e.amount, 0)
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  const daysInMonth = new Date(year, month, 0).getDate()
  const daysPassed = Math.min(now.getDate(), daysInMonth)
  const dailyAvg = daysPassed > 0 ? Math.round(expense / daysPassed) : 0

  const getCategoryName = (id?: string) => {
    if (!id) return '기타'
    return categories.find((c) => c.id === id)?.name ?? '기타'
  }

  const getCategoryIcon = (id?: string) => {
    if (!id) return '📝'
    return categories.find((c) => c.id === id)?.icon ?? '📝'
  }

  const getCategoryById = (id?: string) => {
    if (!id) return undefined
    return categories.find((c) => c.id === id)
  }

  const getTopExpenses = (): { cat: string; amount: number; icon: string }[] => {
    const map: Record<string, number> = {}
    for (const e of filteredEntries.filter((e) => e.type === 'expense')) {
      const key = e.categoryId || 'etc'
      map[key] = (map[key] ?? 0) + e.amount
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([catId, amount]) => ({
        cat: getCategoryName(catId),
        amount,
        icon: getCategoryIcon(catId),
      }))
  }

  const getExpensePieData = () => {
    const map: Record<string, number> = {}
    for (const e of filteredEntries.filter((e) => e.type === 'expense')) {
      const key = e.categoryId || 'etc'
      map[key] = (map[key] ?? 0) + e.amount
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([catId, amount]) => ({
        label: getCategoryName(catId),
        value: amount,
        icon: getCategoryIcon(catId),
      }))
  }

  const getIncomePieData = () => {
    const map: Record<string, number> = {}
    for (const e of filteredEntries.filter((e) => e.type === 'income')) {
      const key = e.categoryId || 'etc'
      map[key] = (map[key] ?? 0) + e.amount
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([catId, amount]) => ({
        label: getCategoryName(catId),
        value: amount,
        icon: getCategoryIcon(catId),
      }))
  }

  const changeMonth = (delta: number) => {
    setMonth((m) => {
      let newM = m + delta
      let newY = year
      if (newM < 1) { newM = 12; newY -= 1 }
      else if (newM > 12) { newM = 1; newY += 1 }
      setYear(newY)
      return newM
    })
  }

  const handleExportCSV = async () => {
    if (filteredEntries.length === 0) {
      Alert.alert('내보내기', '내보낼 데이터가 없습니다.')
      return
    }
    const headers = ['날짜', '유형', '금액', '카테고리', '메모', '결제수단']
    const rows = filteredEntries.map((e) => [
      e.date,
      e.type === 'income' ? '수입' : e.type === 'expense' ? '지출' : '저축',
      e.amount.toString(),
      getCategoryName(e.categoryId),
      e.note || '',
      e.paymentMethod || '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    try {
      await Share.share({ message: csv, title: `money-space-${year}-${month}.csv` })
    } catch {
      Alert.alert('오류', '내보내기 중 오류가 발생했습니다.')
    }
  }

  const handleExportPDF = async () => {
    if (filteredEntries.length === 0) {
      Alert.alert('내보내기', '내보낼 데이터가 없습니다.')
      return
    }
    try {
      await exportToPdf({ entries: filteredEntries, categories, year, month, income, expense, saving, savingsRate, dailyAvg })
    } catch {
      Alert.alert('오류', 'PDF 내보내기 중 오류가 발생했습니다.')
    }
    setShowExportMenu(false)
  }

  const topExpenses = getTopExpenses()
  const totalTopExpense = topExpenses.reduce((s, e) => s + e.amount, 0)
  const expensePieData = getExpensePieData()
  const incomePieData = getIncomePieData()

  const getTopBudget = () => {
    const api = createBudgetApi()
    const topBudget = budgets.sort((a, b) => b.amount - a.amount)[0]
    if (!topBudget) return null
    const used = api.getUsedAmount(topBudget.categoryId, `${year}-${String(month).padStart(2, '0')}`)
    return { budget: topBudget, used, category: getCategoryById(topBudget.categoryId) }
  }

  const topBudgetInfo = getTopBudget()

  return (
    <ScrollView className="flex-1 bg-[#F5F5F7]" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-6 pb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">통계</Text>
        <View>
          <TouchableOpacity className="px-3 py-1.5 bg-gray-100 rounded-xl" onPress={() => setShowExportMenu(!showExportMenu)}>
            <Text className="text-xs text-gray-500 font-medium">내보내기 ▾</Text>
          </TouchableOpacity>
          {showExportMenu && (
            <View className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-md z-10 border border-[rgba(0,0,0,0.06)]">
              <TouchableOpacity className="px-4 py-2.5 border-b border-[rgba(0,0,0,0.04)]" onPress={() => { handleExportCSV(); setShowExportMenu(false) }}>
                <Text className="text-sm text-gray-900">CSV 내보내기</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2.5" onPress={handleExportPDF}>
                <Text className="text-sm text-gray-900">PDF 내보내기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="px-4 mb-3">
        <PeriodSelector selected={periodType} onChange={setPeriodType} />
      </View>

      <View className="flex-row items-center justify-between px-4 mb-4">
        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center bg-gray-100" onPress={() => changeMonth(-1)}>
          <Text className="text-sm text-gray-500">◀</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          {periodType === 'year' ? `${year}년` : `${year}년 ${MONTHS[month - 1]}`}
        </Text>
        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center bg-gray-100" onPress={() => changeMonth(1)}>
          <Text className="text-sm text-gray-500">▶</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 mb-3">
        <Card>
          <Text className="text-sm font-semibold text-gray-900 mb-4">{getPeriodDisplayLabel(periodType, currentDate)} 분석</Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-lg bg-emerald-50 items-center justify-center mb-1.5"><Text className="text-sm">↑</Text></View>
              <Text className="text-xs text-gray-400 mb-1">총 수입</Text>
              <AmountText amount={income} type="income" className="text-sm" showSign={false} />
            </View>
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center mb-1.5"><Text className="text-sm">↓</Text></View>
              <Text className="text-xs text-gray-400 mb-1">총 지출</Text>
              <AmountText amount={expense} type="expense" className="text-sm" showSign={false} />
            </View>
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-lg bg-blue-50 items-center justify-center mb-1.5"><Text className="text-sm">%</Text></View>
              <Text className="text-xs text-gray-400 mb-1">절감률</Text>
              <Text className={`text-sm font-bold ${savingsRate > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{savingsRate}%</Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="flex-row px-4 gap-3 mb-4">
        <Card className="flex-1">
          <Text className="text-xs text-gray-400 mb-1">저축</Text>
          <AmountText amount={saving} type="saving" className="text-sm" showSign={false} />
        </Card>
        <Card className="flex-1">
          <Text className="text-xs text-gray-400 mb-1">일 평균 지출</Text>
          <Text className={`text-sm font-bold ${expense > 0 ? 'text-red-500' : 'text-gray-900'}`}>
            {expense > 0 ? `₩${dailyAvg.toLocaleString()}` : '-'}
          </Text>
        </Card>
      </View>

      <View className="px-4 mb-3">
        <BudgetVsActual
          budget={topBudgetInfo?.budget ?? null}
          actualSpent={topBudgetInfo?.used ?? 0}
          category={topBudgetInfo?.category}
        />
      </View>

      <MonthlyComparisonChart data={monthlyComparisonData} />

      <PieChart data={expensePieData} title="지출 카테고리" />
      <PieChart data={incomePieData} title="수입 카테고리" />

      {topExpenses.length > 0 && (
        <View className="px-4 mt-4 mb-3">
          <Card>
            <Text className="text-sm font-semibold text-gray-900 mb-4">지출 상위 카테고리</Text>
            {topExpenses.map((item, index) => {
              const pct = totalTopExpense > 0 ? Math.round((item.amount / totalTopExpense) * 100) : 0
              return (
                <View key={item.cat} className="flex-row items-center mb-3 last:mb-0">
                  <Text className="text-xs text-gray-300 w-4 font-medium">{index + 1}</Text>
                  <Text className="text-sm mr-2">{item.icon}</Text>
                  <Text className="text-sm text-gray-900 flex-1">{item.cat}</Text>
                  <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-2">
                    <View className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </View>
                  <Text className="text-xs text-red-500 w-20 text-right font-medium">{item.amount.toLocaleString()}원</Text>
                </View>
              )
            })}
          </Card>
        </View>
      )}

      <View className="px-4 mb-3">
        <CategoryChart entries={filteredEntries} type="expense" />
      </View>
      <View className="px-4 mb-3">
        <CategoryChart entries={filteredEntries} type="income" />
      </View>
    </ScrollView>
  )
}
