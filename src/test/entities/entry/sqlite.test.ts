import {
  insertEntry,
  getEntryById,
  deleteEntry,
} from '@/shared/api/entry/sqlite'
import { CreateEntryInput } from '@/entities/entry'

describe('entry sqlite', () => {
  const input: CreateEntryInput = {
    userId: 'user-1',
    amount: 50000,
    type: 'expense',
    date: '2026-06-15',
    isShared: false,
    isRecurring: false,
  }

  it('inserts and reads an entry', () => {
    const entry = insertEntry(input)
    expect(entry.id).toBeDefined()
    expect(entry.amount).toBe(50000)

    const found = getEntryById(entry.id)
    expect(found).not.toBeNull()
    expect(found!.amount).toBe(50000)
  })

  it('deletes an entry', () => {
    const entry = insertEntry(input)
    deleteEntry(entry.id)
    expect(getEntryById(entry.id)).toBeNull()
  })
})
