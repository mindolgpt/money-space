import { getDb } from '@/shared/lib'
import type { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from '@/entities/category'

export function getCategoriesByType(type: CategoryType): Category[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM categories WHERE type = ? ORDER BY sort_order',
    [type],
  )
  return rows.map(rowToCategory)
}

export function getAllCategories(): Category[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM categories ORDER BY type, sort_order',
  )
  return rows.map(rowToCategory)
}

export function getCategoryById(id: string): Category | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    'SELECT * FROM categories WHERE id = ?',
    [id],
  )
  return row ? rowToCategory(row) : null
}

export function createCategoryLocally(input: CreateCategoryInput & { id: string; userId: string; order: number }): Category {
  getDb().runSync(
    `INSERT INTO categories (id, user_id, name, icon, type, is_system, sort_order)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [input.id, input.userId, input.name, input.icon, input.type, input.order],
  )
  return getCategoryById(input.id)!
}

export function updateCategoryLocally(id: string, input: UpdateCategoryInput): Category {
  const existing = getCategoryById(id)
  if (!existing) throw new Error(`Category not found: ${id}`)

  const updates: string[] = []
  const params: any[] = []

  if (input.name !== undefined) {
    updates.push('name = ?')
    params.push(input.name)
  }
  if (input.icon !== undefined) {
    updates.push('icon = ?')
    params.push(input.icon)
  }
  if (input.order !== undefined) {
    updates.push('sort_order = ?')
    params.push(input.order)
  }

  if (updates.length === 0) return existing

  params.push(id)
  getDb().runSync(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
    params,
  )
  return getCategoryById(id)!
}

export function deleteCategoryLocally(id: string): void {
  getDb().runSync('DELETE FROM categories WHERE id = ?', [id])
}

export function getLastSortOrder(type: CategoryType): number {
  const row = getDb().getFirstSync<{ max_order: number }>(
    'SELECT MAX(sort_order) as max_order FROM categories WHERE type = ?',
    [type],
  )
  return row?.max_order ?? 0
}

export function reorderCategoriesLocally(ids: string[]): void {
  ids.forEach((id, index) => {
    getDb().runSync('UPDATE categories SET sort_order = ? WHERE id = ?', [index, id])
  })
}

export function setLastUsedCategory(userId: string, type: CategoryType, categoryId: string): void {
  getDb().runSync(
    `INSERT OR REPLACE INTO category_usage (user_id, type, category_id, used_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [userId, type, categoryId],
  )
}

export function getLastUsedCategory(userId: string, type: CategoryType): Category | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    `SELECT c.* FROM categories c
     JOIN category_usage cu ON c.id = cu.category_id
     WHERE cu.user_id = ? AND cu.type = ?
     ORDER BY cu.used_at DESC
     LIMIT 1`,
    [userId, type],
  )
  return row ? rowToCategory(row) : null
}

function rowToCategory(r: Record<string, any>): Category {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon ?? '',
    type: r.type as CategoryType,
    isSystem: r.is_system === 1,
    order: r.sort_order ?? 0,
    userId: r.user_id === 'system' ? undefined : r.user_id,
  }
}
