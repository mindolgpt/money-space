import { useState, useEffect, useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserSettings } from '@/entities/user'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, createBudgetApi, BUDGET_KEYS } from '@/entities/budget'
import { useCategories, createCategoryApi } from '@/entities/category'

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

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

export function useBudgetManager(visible: boolean, onClose: () => void) {
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

    const categoryApi = createCategoryApi()
    const cats = categoryApi.getByType('expense')
    const usages: Record<string, number> = {}
    for (const cat of cats) {
      const api = createBudgetApi()
      usages[cat.id] = api.getUsedAmount(cat.id, selectedMonth)
    }
    setCategoryUsage(usages)
  }, [visible, budgets, selectedMonth])

  const onMonthChange = useCallback((direction: 'prev' | 'next') => {
    const newMonth = shiftMonth(selectedMonth, direction)
    setSelectedMonth(newMonth)
  }, [selectedMonth])

  const onBudgetAmountChange = useCallback((categoryId: string, value: string) => {
    const numericOnly = value.replace(/[^\d]/g, '')
    if (numericOnly.length > 10) return
    const numValue = numericOnly ? parseInt(numericOnly, 10) : 0
    setBudgetAmounts(prev => ({
      ...prev,
      [categoryId]: numValue,
    }))
  }, [])

  const checkBudgetAlerts = useCallback(() => {
    const categoryApi = createCategoryApi()
    const cats = categoryApi.getByType('expense')

    const overBudget: string[] = []
    const nearBudget: string[] = []

    for (const cat of cats) {
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

  const handleSave = useCallback(async () => {
    const hasAnyBudget = Object.values(budgetAmounts).some(v => v > 0)
    if (!hasAnyBudget) {
      Alert.alert('알림', '하나 이상의 예산을 설정해주세요')
      return
    }
    await executeSave()
  }, [budgetAmounts, executeSave])

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

  const getProgressData = useCallback((categoryId: string) => {
    const budgetAmount = budgetAmounts[categoryId] ?? 0
    const used = categoryUsage[categoryId] ?? 0
    const remaining = budgetAmount - used
    const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0
    const isOverBudget = remaining < 0
    return { budget: budgetAmount, used, remaining, percent, isOverBudget }
  }, [budgetAmounts, categoryUsage])

  const hasBudgets = budgets.length > 0

  return {
    selectedMonth,
    budgetAmounts,
    categoryUsage,
    isSubmitting,
    expenseCategories,
    budgetAlertEnabled,
    hasBudgets,
    onMonthChange,
    onBudgetAmountChange,
    handleSave,
    handleClearAll,
    getProgressData,
    formatMonthDisplay,
  }
}
