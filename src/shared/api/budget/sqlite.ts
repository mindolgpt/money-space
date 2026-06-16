import { getDb } from '@/shared/lib'
import { Budget } from '@/entities/budget/model/types'

export function upsertBudget(budget: Budget): void {
  getDb().runSync(
    'INSERT OR REPLACE INTO budgets (id, user_id, family_id, category_id, amount, month) VALUES (?, ?, ?, ?, ?, ?)',
    [
      budget.id,
      budget.userId ?? null,
      budget.familyId ?? null,
      budget.categoryId,
      budget.amount,
      budget.month,
    ],
  )
}

export function getBudgetsByMonth(month: string): Budget[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM budgets WHERE month = ?',
    [month],
  )
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    familyId: r.family_id,
    categoryId: r.category_id,
    amount: r.amount,
    month: r.month,
  }))
}
