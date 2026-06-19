import { insertEntry } from '@/shared/api/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import { createCategoryApi } from '@/entities/category'
import type { Entry, CreateEntryInput } from '@/entities/entry/model/types'

export function createEntryLocally(input: CreateEntryInput): Entry {
  const syncQueue = createSyncQueueApi()
  const categoryApi = createCategoryApi()

  const entry = insertEntry(input)

  if (input.categoryId) {
    categoryApi.setLastUsed(input.userId, input.type, input.categoryId)
  }

  syncQueue.enqueue('entries', entry.id, 'insert', entry)
  return entry
}
