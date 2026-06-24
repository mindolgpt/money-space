import { ScrollView, View, Text, TouchableOpacity, Share, Alert } from 'react-native'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react-native'
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
import { colors } from '@/shared/lib/colors'
import { Card, AmountText, TopAppBar, ProgressBar } from '@/shared/ui'

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
    <ScrollView className="flex-1 bg-bg-primary" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <TopAppBar
        title="통계"
        trailing={
          <TouchableOpacity
            className="px-3 py-1.5 bg-bg-tertiary rounded-lg flex-row items-center"
            onPress={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={14} color={colors.textTertiary} />
            <Text className="text-label-sm font-medium ml-1.5">내보내기</Text>
          </TouchableOpacity>
        }
      />
      {showExportMenu && (
        <View className="px-4 mb-2">
          <Card padded={false} className="overflow-hidden">
            <TouchableOpacity className="px-4 py-3 border-b border-border" onPress={() => { handleExportCSV(); setShowExportMenu(false) }}>
              <Text className="text-body-md font-semibold">CSV 내보내기</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-3" onPress={handleExportPDF}>
              <Text className="text-body-md font-semibold">PDF 내보내기</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      <View className="px-4 mb-3">
        <PeriodSelector selected={periodType} onChange={setPeriodType} />
      </View>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center bg-bg-tertiary" onPress={() => changeMonth(-1)}>
          <ChevronLeft size={20} color={colors.textTertiary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-text-primary">
          {periodType === 'year' ? `${year}년` : `${year}년 ${MONTHS[month - 1]}`}
        </Text>
        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center bg-bg-tertiary" onPress={() => changeMonth(1)}>
          <ChevronRight size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="px-4 mb-3">
        <Card>
          <Text className="text-[13px] font-semibold text-text-primary mb-4 tracking-tight">
            {getPeriodDisplayLabel(periodType, currentDate)} 분석
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-md bg-semantic-income/10 items-center justify-center mb-1.5">
                <TrendingUp size={16} color={colors.accentGreen} />
              </View>
              <Text className="text-label-sm text-text-secondary mb-1">총 수입</Text>
              <AmountText amount={income} type="income" className="text-label-md" showSign={false} />
            </View>
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-md bg-semantic-expense/10 items-center justify-center mb-1.5">
                <TrendingDown size={16} color={colors.accentRed} />
              </View>
              <Text className="text-label-sm text-text-secondary mb-1">총 지출</Text>
              <AmountText amount={expense} type="expense" className="text-label-md" showSign={false} />
            </View>
            <View className="flex-1 items-center">
              <View className="w-9 h-9 rounded-md bg-bg-tertiary items-center justify-center mb-1.5">
                <Text className="text-label-md font-bold text-text-primary">%</Text>
              </View>
              <Text className="text-label-sm text-text-secondary mb-1">절감률</Text>
              <Text className={`text-label-md font-semibold ${savingsRate > 0 ? 'text-semantic-income' : 'text-semantic-expense'}`}>
                {savingsRate}%
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Saving & Daily Avg */}
      <View className="flex-row px-4 gap-3 mb-4">
        <Card className="flex-1 self-start">
          <Text className="text-label-sm font-medium">저축</Text>
          <AmountText amount={saving} type="saving" className="text-label-md" showSign={false} />
        </Card>
        <Card className="flex-1 self-start">
          <Text className="text-label-sm font-medium">일 평균 지출</Text>
          <Text className={`text-label-md font-semibold ${expense > 0 ? 'text-semantic-expense' : 'text-text-primary'}`}>
            {expense > 0 ? `₩${dailyAvg.toLocaleString()}` : '-'}
          </Text>
        </Card>
      </View>

      {/* Budget vs Actual */}
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

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <View className="px-4 mt-4 mb-3">
          <Card>
            <Text className="text-label-md font-semibold text-text-primary mb-4 tracking-tight">지출 상위 카테고리</Text>
            {topExpenses.map((item, index) => {
              const pct = totalTopExpense > 0 ? Math.round((item.amount / totalTopExpense) * 100) : 0
              return (
                <View key={item.cat} className="flex-row items-center mb-3 last:mb-0">
                  <Text className="text-label-sm font-medium">{index + 1}</Text>
                  <FileText size={16} color={colors.textTertiary} className="mr-2" />
                  <Text className="text-body-md font-semibold text-text-primary flex-1">{item.cat}</Text>
                  <ProgressBar value={pct} variant="red" size="sm" className="flex-1 mr-2" />
                  <Text className="text-body-md font-semibold text-semantic-expense w-20 text-right">{item.amount.toLocaleString()}원</Text>
                </View>
              )
            })}
          </Card>
        </View>
      )}

      {/* Category Charts */}
      <View className="px-4 mb-3">
        <CategoryChart entries={filteredEntries} type="expense" />
      </View>
      <View className="px-4 mb-3">
        <CategoryChart entries={filteredEntries} type="income" />
      </View>
    </ScrollView>
  )
}
