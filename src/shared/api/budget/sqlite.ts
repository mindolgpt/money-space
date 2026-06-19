import { getDb } from '@/shared/lib'
import type { Budget } from '@/entities/budget'

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

export function getBudgetById(id: string): Budget | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    'SELECT * FROM budgets WHERE id = ?',
    [id],
  )
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    categoryId: row.category_id,
    amount: row.amount,
    month: row.month,
  }
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

export function getBudgetsByUserAndMonth(userId: string, month: string): Budget[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM budgets WHERE user_id = ? AND month = ?',
    [userId, month],
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

export function deleteBudget(id: string): void {
  getDb().runSync('DELETE FROM budgets WHERE id = ?', [id])
}

export function getUsedAmount(categoryId: string, month: string): number {
  const row = getDb().getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM entries
     WHERE category_id = ? AND type = 'expense' AND date LIKE ?`,
    [categoryId, `${month}%`],
  )
  return row?.total ?? 0
}
