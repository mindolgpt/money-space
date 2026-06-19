import { supabase } from '@/shared/api/supabase'
import type { Category, CategoryType } from '@/entities/category'

export async function fetchCategoriesByType(type: CategoryType): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function fetchSystemCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('user_id', null)
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function fetchUserCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createCategory(input: {
  id: string
  name: string
  icon: string
  type: CategoryType
  userId: string
}): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      id: input.id,
      name: input.name,
      icon: input.icon,
      type: input.type,
      user_id: input.userId,
      is_system: false,
      sort_order: 0,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateCategory(id: string, input: {
  name?: string
  icon?: string
  sort_order?: number
}): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function deleteCategoryRemote(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function reorderCategoriesRemote(categoryIds: string[]): Promise<void> {
  const updates = categoryIds.map((id, index) => ({
    id,
    sort_order: index,
    updated_at: new Date().toISOString(),
  }))
  for (const update of updates) {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: update.sort_order, updated_at: update.updated_at })
      .eq('id', update.id)
    if (error) throw error
  }
}

function mapRow(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? '',
    type: row.type as CategoryType,
    isSystem: row.is_system === 1 || row.is_system === true,
    order: row.sort_order ?? 0,
    userId: row.user_id ?? undefined,
  }
}
