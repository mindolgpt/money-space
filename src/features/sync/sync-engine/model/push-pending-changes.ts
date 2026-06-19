import { createEntryApi } from '@/entities/entry'
import { createSyncQueueApi } from '@/entities/sync-queue'
import { detectConflict, resolveConflict } from '@/features/sync/sync-engine/model/conflict-resolution'
import { SYNC_RETRY_MAX } from '@/shared/config'
import { getLocalSettings } from '@/shared/api/user'
import { isWifi } from '@/features/sync/sync-engine/model/network-status'
import { useAuthStore } from '@/features/auth/auth-manager'

let isProcessing = false

async function shouldSync(): Promise<boolean> {
  const userId = useAuthStore.getState().user?.id
  if (!userId) return true

  const settings = getLocalSettings(userId)
  if (!settings?.sync?.wifiOnly) return true

  return await isWifi()
}

export async function pushPendingChanges(): Promise<void> {
  if (isProcessing) return
  isProcessing = true

  try {
    if (!(await shouldSync())) return

    const syncQueue = createSyncQueueApi()
    const changes = syncQueue.getPending()

    if (changes.length === 0) return

    for (const change of changes) {
      try {
        syncQueue.markProcessing(change.id!)
        await executeSyncOperation(change)
        syncQueue.markDone(change.id!)
      } catch (error: any) {
        await handleSyncError(change, error, syncQueue)
      }
    }
  } finally {
    isProcessing = false
  }
}

async function executeSyncOperation(change: {
  id?: number
  tableName: string
  recordId: string
  operation: string
  payload: string
}): Promise<void> {
  const payload = JSON.parse(change.payload)
  const entryApi = createEntryApi()

  switch (change.tableName) {
    case 'entries': {
      if (change.operation === 'delete') {
        try {
          await entryApi.remote.delete(change.recordId)
        } catch (error: any) {
          if (error?.message?.includes('RECORD_NOT_FOUND') || error?.code === 'PGRST116') {
            return
          }
          throw error
        }
      } else {
        const conflict = await detectConflict(change.recordId, 'entries')
        if (conflict) {
          const resolved = resolveConflict(conflict, 'remote')
          await entryApi.remote.upsert(resolved)
        } else {
          await entryApi.remote.upsert(payload)
        }
      }
      break
    }
  }
}

async function handleSyncError(
  change: {
    id?: number
    retryCount: number
  },
  error: any,
  syncQueue: ReturnType<typeof createSyncQueueApi>,
): Promise<void> {
  if (change.retryCount >= SYNC_RETRY_MAX) {
    syncQueue.markFailed(change.id!)
  } else {
    syncQueue.incrementRetry(change.id!)
  }
}

export function isSyncing(): boolean {
  return isProcessing
}
