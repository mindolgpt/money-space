import { createEntryApi } from '@/entities/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'

export function removeEntryLocally(id: string): void {
  const entryApi = createEntryApi()
  const syncQueue = createSyncQueueApi()
  entryApi.local.delete(id)
  syncQueue.enqueue('entries', id, 'delete', { id })
}
