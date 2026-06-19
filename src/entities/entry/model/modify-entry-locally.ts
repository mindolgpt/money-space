import { updateEntry } from '@/shared/api/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import type { Entry } from '@/entities/entry/model/types'

export function modifyEntryLocally(
  id: string,
  changes: Record<string, any>,
): Entry | null {
  const syncQueue = createSyncQueueApi()
  const entry = updateEntry(id, changes)
  if (entry) {
    syncQueue.enqueue('entries', id, 'update', entry)
  }
  return entry
}
