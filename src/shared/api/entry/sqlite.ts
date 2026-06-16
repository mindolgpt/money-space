import { getDb } from '@/shared/lib'
import { Entry, CreateEntryInput } from '@/entities/entry/model/types'

export function insertEntry(input: CreateEntryInput): Entry {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  db.runSync(
    `INSERT INTO entries (id, user_id, family_id, category_id, amount, type, payment_method, note, date, photo_urls, is_shared, is_recurring, recurring_rule, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.familyId ?? null,
      input.categoryId ?? null,
      input.amount,
      input.type,
      input.paymentMethod ?? null,
      input.note ?? null,
      input.date,
      input.photoUrls ? JSON.stringify(input.photoUrls) : null,
      input.isShared ? 1 : 0,
      input.isRecurring ? 1 : 0,
      input.recurringRule ?? null,
      now,
      now,
    ],
  )
  return getEntryById(id)!
}

export function getEntryById(id: string): Entry | null {
  const db = getDb()
  const row = db.getFirstSync<Record<string, any>>(
    'SELECT * FROM entries WHERE id = ?',
    [id],
  )
  return row ? rowToEntry(row) : null
}

export function getEntriesByMonth(
  userId: string,
  year: number,
  month: number,
): Entry[] {
  const db = getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const rows = db.getAllSync<Record<string, any>>(
    'SELECT * FROM entries WHERE user_id = ? AND date LIKE ? ORDER BY date DESC, created_at DESC',
    [userId, `${prefix}%`],
  )
  return rows.map(rowToEntry)
}

export function updateEntry(
  id: string,
  input: Record<string, any>,
): Entry | null {
  const db = getDb()
  const now = new Date().toISOString()
  const setClauses: string[] = ['updated_at = ?']
  const params: any[] = [now]
  for (const [key, value] of Object.entries(input)) {
    const col = camelToSnake(key)
    setClauses.push(`${col} = ?`)
    params.push(value)
  }
  params.push(id)
  db.runSync(`UPDATE entries SET ${setClauses.join(', ')} WHERE id = ?`, params)
  return getEntryById(id)
}

export function deleteEntry(id: string): void {
  getDb().runSync('DELETE FROM entries WHERE id = ?', [id])
}

export function upsertEntryFromRemote(row: Record<string, any>): void {
  getDb().runSync(
    `INSERT OR REPLACE INTO entries
     (id, user_id, family_id, category_id, amount, type, payment_method, note, date, photo_urls, is_shared, is_recurring, recurring_rule, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.user_id,
      row.family_id,
      row.category_id,
      row.amount,
      row.type,
      row.payment_method,
      row.note,
      row.date,
      row.photo_urls ? JSON.stringify(row.photo_urls) : null,
      row.is_shared ? 1 : 0,
      row.is_recurring ? 1 : 0,
      row.recurring_rule,
      row.created_at,
      row.updated_at,
    ],
  )
}

export function searchEntries(query: string): Entry[] {
  const db = getDb()
  const rows = db.getAllSync<Record<string, any>>(
    'SELECT * FROM entries WHERE note LIKE ? OR CAST(amount AS TEXT) LIKE ? ORDER BY date DESC LIMIT 50',
    [`%${query}%`, `%${query}%`],
  )
  return rows.map(rowToEntry)
}

function rowToEntry(row: Record<string, any>): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    amount: row.amount,
    type: row.type,
    paymentMethod: row.payment_method ?? undefined,
    note: row.note ?? undefined,
    date: row.date,
    photoUrls: row.photo_urls ? JSON.parse(row.photo_urls) : undefined,
    isShared: Boolean(row.is_shared),
    isRecurring: Boolean(row.is_recurring),
    recurringRule: row.recurring_rule ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}
