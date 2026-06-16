import { createEntryApi } from '@/entities/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import type { Entry } from '@/entities/entry'

export function modifyEntryLocally(
  id: string,
  changes: Record<string, any>,
): Entry | null {
  const entryApi = createEntryApi()
  const syncQueue = createSyncQueueApi()
  const entry = entryApi.local.update(id, changes)
  if (entry) {
    syncQueue.enqueue('entries', id, 'update', entry)
  }
  return entry
}
