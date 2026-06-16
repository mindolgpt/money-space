import { createEntryApi } from '@/entities/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import { SYNC_RETRY_MAX } from '@/shared/config'

export async function pushPendingChanges(): Promise<void> {
  const syncQueue = createSyncQueueApi()
  const changes = syncQueue.getPending()
  const entryApi = createEntryApi()

  for (const change of changes) {
    try {
      const payload = JSON.parse(change.payload)

      switch (change.tableName) {
        case 'entries':
          if (change.operation === 'delete') {
            await entryApi.remote.delete(change.recordId)
          } else {
            await entryApi.remote.upsert(payload)
          }
          break
      }

      syncQueue.markDone(change.id!)
    } catch {
      if (change.retryCount >= SYNC_RETRY_MAX) {
        syncQueue.markFailed(change.id!)
      } else {
        syncQueue.incrementRetry(change.id!)
      }
    }
  }
}
