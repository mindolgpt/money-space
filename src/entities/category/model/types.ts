export type CategoryType = 'income' | 'expense' | 'saving'

export type Category = {
  id: string
  name: string
  icon: string
  type: CategoryType
  isSystem: boolean
  order: number
  userId?: string
}

export type CreateCategoryInput = {
  name: string
  icon: string
  type: CategoryType
}

export type UpdateCategoryInput = {
  name?: string
  icon?: string
  order?: number
}
