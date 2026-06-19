export type Budget = {
  id: string
  userId?: string
  familyId?: string
  categoryId: string
  amount: number
  month: string
}

export type CreateBudgetInput = Omit<Budget, 'id'>
export type UpdateBudgetInput = { id: string; amount: number }

export type BudgetProgress = {
  budget: number
  used: number
  remaining: number
  percent: number
  isOverBudget: boolean
}
