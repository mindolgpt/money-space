import { getDb } from '@/shared/lib'

export function getCategoriesByType(type: string) {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM categories WHERE type = ? ORDER BY sort_order',
    [type],
  )
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    type: r.type,
  }))
}
