import { createEntryApi } from '@/entities/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import type { Entry, CreateEntryInput } from '@/entities/entry'

export function createEntryLocally(input: CreateEntryInput): Entry {
  const entryApi = createEntryApi()
  const syncQueue = createSyncQueueApi()
  const entry = entryApi.local.insert(input)
  syncQueue.enqueue('entries', entry.id, 'insert', entry)
  return entry
}
