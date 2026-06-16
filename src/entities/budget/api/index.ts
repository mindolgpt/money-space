import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as budgetSqlite from '@/shared/api/budget'
import type { Budget } from '@/entities/budget/model/types'

export const BUDGET_KEYS = {
  all: () => ['budgets'] as const,
  lists: () => [...BUDGET_KEYS.all(), 'list'] as const,
  list: (month: string) => [...BUDGET_KEYS.lists(), month] as const,
}

export function createBudgetApi() {
  return {
    upsert: budgetSqlite.upsertBudget,
    getByMonth: budgetSqlite.getBudgetsByMonth,
  }
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.list(month),
    queryFn: () => budgetSqlite.getBudgetsByMonth(month),
    staleTime: Infinity,
  })
}

export function useUpsertBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (budget: Budget) => budgetSqlite.upsertBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
    },
  })
}
