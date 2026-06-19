import { deleteEntry } from '@/shared/api/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'

export function removeEntryLocally(id: string): void {
  const syncQueue = createSyncQueueApi()
  deleteEntry(id)
  syncQueue.enqueue('entries', id, 'delete', { id })
}
