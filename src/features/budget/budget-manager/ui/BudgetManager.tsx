import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserSettings } from '@/entities/user'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, createBudgetApi, BUDGET_KEYS } from '@/entities/budget'
import { useCategories, createCategoryApi } from '@/entities/category'
import { BudgetProgressBar } from '@/features/budget/budget-manager/ui/BudgetProgressBar'

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

type Props = {
  visible: boolean
  onClose: () => void
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${MONTHS[now.getMonth()]}`
}

function shiftMonth(month: string, direction: 'prev' | 'next'): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon - 1 + (direction === 'next' ? 1 : -1), 1)
  return `${date.getFullYear()}-${MONTHS[date.getMonth()]}`
}

function formatMonthDisplay(month: string): string {
  const [year, mon] = month.split('-')
  return `${year}년 ${parseInt(mon, 10)}월`
}

export function BudgetManager({ visible, onClose }: Props) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, number>>({})
  const [categoryUsage, setCategoryUsage] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: budgets = [] } = useBudgets(userId, selectedMonth)
  const { data: expenseCategories = [] } = useCategories('expense')
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const { data: userSettings } = useUserSettings(userId)
  const budgetAlertEnabled = userSettings?.notifications?.budgetAlert ?? false

  const existingBudgetsRef = useRef<Record<string, { id: string; amount: number }>>({})

  useEffect(() => {
    if (!visible) return

    const initial: Record<string, number> = {}
    const existingMap: Record<string, { id: string; amount: number }> = {}

    budgets.forEach(b => {
      initial[b.categoryId] = b.amount
      existingMap[b.categoryId] = { id: b.id, amount: b.amount }
    })

    setBudgetAmounts(initial)
    existingBudgetsRef.current = existingMap

    fetchCategoryUsage(selectedMonth)
  }, [visible, budgets, selectedMonth, fetchCategoryUsage])

  const fetchCategoryUsage = useCallback(async (month: string) => {
    const categoryApi = createCategoryApi()
    const categories = categoryApi.getByType('expense')

    const usages: Record<string, number> = {}
    for (const cat of categories) {
      const api = createBudgetApi()
      usages[cat.id] = api.getUsedAmount(cat.id, month)
    }
    setCategoryUsage(usages)
  }, [])

  const onOpen = useCallback((month?: string) => {
    const targetMonth = month || getCurrentMonth()
    setSelectedMonth(targetMonth)
  }, [])

  const onBudgetAmountChange = useCallback((categoryId: string, value: string) => {
    const numericOnly = value.replace(/[^\d]/g, '')
    if (numericOnly.length > 10) return

    const numValue = numericOnly ? parseInt(numericOnly, 10) : 0
    setBudgetAmounts(prev => ({
      ...prev,
      [categoryId]: numValue,
    }))
  }, [])

  const onMonthChange = useCallback((direction: 'prev' | 'next') => {
    const newMonth = shiftMonth(selectedMonth, direction)
    setSelectedMonth(newMonth)
  }, [selectedMonth])

  const handleSave = useCallback(async () => {
    const hasAnyBudget = Object.values(budgetAmounts).some(v => v > 0)
    if (!hasAnyBudget) {
      Alert.alert('알림', '하나 이상의 예산을 설정해주세요')
      return
    }

    await executeSave()
  }, [budgetAmounts, executeSave])

  const executeSave = useCallback(async () => {
    setIsSubmitting(true)

    try {
      const existingMap = existingBudgetsRef.current

      const promises = Object.entries(budgetAmounts).map(async ([categoryId, amount]) => {
        const existing = existingMap[categoryId]

        if (existing) {
          if (existing.amount !== amount) {
            if (amount === 0) {
              await deleteBudget.mutateAsync(existing.id)
            } else {
              await updateBudget.mutateAsync({ id: existing.id, amount })
            }
          }
        } else if (amount > 0) {
          await createBudget.mutateAsync({
            userId,
            categoryId,
            amount,
            month: selectedMonth,
          })
        }
      })

      await Promise.all(promises)

      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })

      if (budgetAlertEnabled) {
        checkBudgetAlerts()
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onClose()
    } catch {
      Alert.alert('오류', '저장에 실패했습니다')
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setIsSubmitting(false)
    }
  }, [budgetAmounts, selectedMonth, userId, onClose, queryClient, createBudget, updateBudget, deleteBudget, budgetAlertEnabled, checkBudgetAlerts])

  const handleClearAll = useCallback(() => {
    Alert.alert(
      '예산 초기화',
      '모든 예산을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(budgets.map(b => deleteBudget.mutateAsync(b.id)))
            setBudgetAmounts({})
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          },
        },
      ],
    )
  }, [budgets, deleteBudget, queryClient])

  useEffect(() => {
    if (visible) {
      onOpen(selectedMonth)
    }
  }, [visible, onOpen, selectedMonth])

  const getProgressData = useCallback((categoryId: string) => {
    const budgetAmount = budgetAmounts[categoryId] ?? 0
    const used = categoryUsage[categoryId] ?? 0
    const remaining = budgetAmount - used
    const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0
    const isOverBudget = remaining < 0

    return { budget: budgetAmount, used, remaining, percent, isOverBudget }
  }, [budgetAmounts, categoryUsage])

  const checkBudgetAlerts = useCallback(() => {
    const categoryApi = createCategoryApi()
    const categories = categoryApi.getByType('expense')

    const overBudget: string[] = []
    const nearBudget: string[] = []

    for (const cat of categories) {
      const budgetAmount = budgetAmounts[cat.id] ?? 0
      if (budgetAmount <= 0) continue

      const used = categoryUsage[cat.id] ?? 0
      const percent = (used / budgetAmount) * 100

      if (percent >= 100) {
        overBudget.push(cat.name)
      } else if (percent >= 80) {
        nearBudget.push(cat.name)
      }
    }

    if (overBudget.length > 0) {
      Alert.alert(
        '예산 초과',
        `${overBudget.join(', ')}\n예산이 초과되었습니다. 지출을 조정해주세요.`,
        [{ text: '확인' }],
      )
    } else if (nearBudget.length > 0) {
      Alert.alert(
        '예산 임박',
        `${nearBudget.join(', ')}\n예산의 80% 이상을 사용했습니다.`,
        [{ text: '확인' }],
      )
    }
  }, [budgetAmounts, categoryUsage])

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-bg-primary">
        <View className="px-4 pt-4 pb-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-text-primary">예산 설정</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-base text-text-secondary">닫기</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => onMonthChange('prev')}
              className="p-2"
            >
              <ChevronLeft size={20} color="#007AFF" />
            </TouchableOpacity>

            <Text className="text-base font-medium text-text-primary">
              {formatMonthDisplay(selectedMonth)}
            </Text>

            <TouchableOpacity
              onPress={() => onMonthChange('next')}
              className="p-2"
            >
              <ChevronRight size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-3">
          {expenseCategories.map((cat) => {
            const progress = getProgressData(cat.id)
            const amountStr = budgetAmounts[cat.id]?.toString() ?? ''

            return (
              <View key={cat.id} className="bg-bg-secondary border border-border rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <FileText size={16} color="#86868B" />
                    <Text className="font-medium text-text-primary ml-2">{cat.name}</Text>
                  </View>
                  {progress.budget > 0 && (
                    <Text className="text-xs text-text-secondary">
                      {progress.budget.toLocaleString()}원 설정
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 bg-bg-tertiary rounded-xl px-4 py-3 text-base text-text-primary mr-2"
                    placeholder="예산 금액"
                    placeholderTextColor="#C7C7CC"
                    keyboardType="numeric"
                    value={amountStr}
                    onChangeText={(v) => onBudgetAmountChange(cat.id, v)}
                  />
                  <Text className="text-sm text-text-secondary">원</Text>
                </View>

                {progress.budget > 0 && (
                  <View className="pt-2">
                    <BudgetProgressBar
                      categoryName={cat.name}
                      spent={progress.used}
                      budget={progress.budget}
                    />
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>

        <View className="px-4 py-3 border-t border-border">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-3.5 bg-bg-tertiary rounded-xl items-center"
              onPress={handleClearAll}
              disabled={budgets.length === 0}
            >
              <Text className={`text-sm font-medium ${budgets.length === 0 ? 'text-text-tertiary' : 'text-semantic-expense'}`}>
                초기화
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-[3] py-3.5 bg-accent-blue rounded-xl items-center"
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text className="text-white text-sm font-semibold">
                {isSubmitting ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}