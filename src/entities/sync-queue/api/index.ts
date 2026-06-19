import { useQuery } from '@tanstack/react-query'
import * as syncQueueSqlite from '@/shared/api/sync-queue'
import type {
  PendingChange,
  SyncState,
  SyncProgress,
} from '@/entities/sync-queue/model/types'

export const SYNC_KEYS = {
  all: () => ['sync'] as const,
  queue: () => [...SYNC_KEYS.all(), 'queue'] as const,
  status: () => [...SYNC_KEYS.all(), 'status'] as const,
  progress: () => [...SYNC_KEYS.all(), 'progress'] as const,
}

export function createSyncQueueApi() {
  return {
    enqueue: syncQueueSqlite.enqueueChange,
    getPending: syncQueueSqlite.getPendingChanges,
    getFailed: syncQueueSqlite.getFailedChanges,
    getAll: syncQueueSqlite.getAllChanges,
    getCounts: syncQueueSqlite.getChangeCountByStatus,
    markDone: syncQueueSqlite.markChangeDone,
    markProcessing: syncQueueSqlite.markChangeProcessing,
    markFailed: syncQueueSqlite.markChangeFailed,
    incrementRetry: syncQueueSqlite.incrementRetryCount,
    resetToPending: syncQueueSqlite.resetToPending,
    removeFromQueue: syncQueueSqlite.removeFromQueue,
    clearCompleted: syncQueueSqlite.clearCompleted,
  }
}

export function usePendingChanges() {
  return useQuery({
    queryKey: SYNC_KEYS.queue(),
    queryFn: (): PendingChange[] => {
      const api = createSyncQueueApi()
      return api.getPending()
    },
    refetchInterval: 10000,
  })
}

export function useSyncStatus() {
  return useQuery({
    queryKey: SYNC_KEYS.status(),
    queryFn: (): SyncState => {
      const api = createSyncQueueApi()
      const counts = api.getCounts()
      return {
        lastSyncedAt: null,
        pendingCount: counts.pending + counts.failed,
        isOnline: true,
        isSyncing: counts.processing > 0,
      }
    },
    refetchInterval: 5000,
  })
}

export function useSyncProgress() {
  return useQuery({
    queryKey: SYNC_KEYS.progress(),
    queryFn: (): SyncProgress => {
      const api = createSyncQueueApi()
      const all = api.getAll()
      return {
        total: all.length,
        completed: all.filter((c) => c.status === 'pending').length,
        failed: all.filter((c) => c.status === 'failed').length,
        current: null,
      }
    },
    refetchInterval: 5000,
  })
}

