import * as syncQueueSqlite from '@/shared/api/sync-queue/sqlite'

export function createSyncQueueApi() {
  return {
    enqueue: syncQueueSqlite.enqueueChange,
    getPending: syncQueueSqlite.getPendingChanges,
    markDone: syncQueueSqlite.markChangeDone,
    markFailed: syncQueueSqlite.markChangeFailed,
    incrementRetry: syncQueueSqlite.incrementRetryCount,
  }
}
