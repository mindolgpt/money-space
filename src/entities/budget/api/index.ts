import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as budgetSqlite from '@/shared/api/budget'
import type { Budget, CreateBudgetInput, UpdateBudgetInput, BudgetProgress } from '@/entities/budget/model/types'

export const BUDGET_KEYS = {
  all: () => ['budgets'] as const,
  lists: () => [...BUDGET_KEYS.all(), 'list'] as const,
  list: (userId: string, month: string) =>
    [...BUDGET_KEYS.lists(), { userId, month }] as const,
  detail: (id: string) => ['budgets', id] as const,
  usage: (categoryId: string, month: string) =>
    ['budgets', 'usage', { categoryId, month }] as const,
}

export function createBudgetApi() {
  return {
    upsert: budgetSqlite.upsertBudget,
    getByMonth: budgetSqlite.getBudgetsByMonth,
    getByUserAndMonth: budgetSqlite.getBudgetsByUserAndMonth,
    getById: budgetSqlite.getBudgetById,
    delete: budgetSqlite.deleteBudget,
    getUsedAmount: budgetSqlite.getUsedAmount,
  }
}

export function useBudgets(userId: string, month: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.list(userId, month),
    queryFn: () => budgetSqlite.getBudgetsByUserAndMonth(userId, month),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useBudgetProgress(categoryId: string, month: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.usage(categoryId, month),
    queryFn: async (): Promise<BudgetProgress> => {
      const budgets = budgetSqlite.getBudgetsByMonth(month)
      const budget = budgets.find(b => b.categoryId === categoryId)
      const budgetAmount = budget?.amount ?? 0
      const used = budgetSqlite.getUsedAmount(categoryId, month)
      const remaining = budgetAmount - used
      const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0
      return {
        budget: budgetAmount,
        used,
        remaining,
        percent,
        isOverBudget: remaining < 0,
      }
    },
    enabled: !!categoryId && !!month,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const id = `${input.month}-${input.categoryId}`
      const budget: Budget = { ...input, id }
      budgetSqlite.upsertBudget(budget)
      return budget
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.lists() })
      queryClient.invalidateQueries({
        queryKey: BUDGET_KEYS.usage(input.categoryId, input.month),
      })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, amount }: UpdateBudgetInput) => {
      const existing = budgetSqlite.getBudgetById(id)
      if (!existing) throw new Error('Budget not found')
      const updated: Budget = { ...existing, amount }
      budgetSqlite.upsertBudget(updated)
      return updated
    },
    onSuccess: (budget) => {
      if (budget) {
        queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
        queryClient.invalidateQueries({
          queryKey: BUDGET_KEYS.usage(budget.categoryId, budget.month),
        })
      }
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const budget = budgetSqlite.getBudgetById(id)
      budgetSqlite.deleteBudget(id)
      return budget
    },
    onSuccess: (budget) => {
      if (budget) {
        queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
        queryClient.invalidateQueries({
          queryKey: BUDGET_KEYS.usage(budget.categoryId, budget.month),
        })
      }
    },
  })
}
