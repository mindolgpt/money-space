export type SyncOperation = 'insert' | 'update' | 'delete'

export type SyncStatus = 'pending' | 'processing' | 'failed'

export type PendingChange = {
  id?: number
  tableName: string
  recordId: string
  operation: SyncOperation
  payload: string
  status: SyncStatus
  retryCount: number
  createdAt: string
}

export type SyncState = {
  lastSyncedAt: number | null
  pendingCount: number
  isOnline: boolean
  isSyncing: boolean
}

export type SyncProgress = {
  total: number
  completed: number
  failed: number
  current: string | null
}

export type SyncConflict = {
  localId: string
  tableName: string
  local: Record<string, any>
  remote: Record<string, any>
  localUpdatedAt: string
  remoteUpdatedAt: string
}

export type ConflictStrategy = 'local' | 'remote' | 'merge'
