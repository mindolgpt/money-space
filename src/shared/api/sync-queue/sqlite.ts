import { getDb } from '@/shared/lib'
import type { PendingChange, SyncOperation } from '@/entities/sync-queue'

export function enqueueChange(
  tableName: string,
  recordId: string,
  operation: string,
  payload: Record<string, any>,
): void {
  getDb().runSync(
    `INSERT INTO pending_changes (table_name, record_id, operation, payload, status, retry_count)
     VALUES (?, ?, ?, ?, 'pending', 0)`,
    [tableName, recordId, operation, JSON.stringify(payload)],
  )
}

export function getPendingChanges(): PendingChange[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM pending_changes WHERE status = 'pending' ORDER BY created_at ASC",
  )
  return rows.map(rowToChange)
}

export function getFailedChanges(): PendingChange[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM pending_changes WHERE status = 'failed' ORDER BY created_at ASC",
  )
  return rows.map(rowToChange)
}

export function getAllChanges(): PendingChange[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM pending_changes ORDER BY created_at ASC',
  )
  return rows.map(rowToChange)
}

export function getChangeCountByStatus(): {
  pending: number
  processing: number
  failed: number
} {
  const db = getDb()
  const pending = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM pending_changes WHERE status = 'pending'",
  )
  const processing = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM pending_changes WHERE status = 'processing'",
  )
  const failed = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM pending_changes WHERE status = 'failed'",
  )
  return {
    pending: pending?.c ?? 0,
    processing: processing?.c ?? 0,
    failed: failed?.c ?? 0,
  }
}

export function markChangeDone(id: number): void {
  getDb().runSync('DELETE FROM pending_changes WHERE id = ?', [id])
}

export function markChangeProcessing(id: number): void {
  getDb().runSync(
    "UPDATE pending_changes SET status = 'processing' WHERE id = ?",
    [id],
  )
}

export function markChangeFailed(id: number): void {
  getDb().runSync(
    "UPDATE pending_changes SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?",
    [id],
  )
}

export function incrementRetryCount(id: number): void {
  getDb().runSync(
    'UPDATE pending_changes SET retry_count = retry_count + 1 WHERE id = ?',
    [id],
  )
}

export function resetToPending(id: number): void {
  getDb().runSync(
    "UPDATE pending_changes SET status = 'pending', retry_count = 0 WHERE id = ?",
    [id],
  )
}

export function removeFromQueue(id: number): void {
  getDb().runSync('DELETE FROM pending_changes WHERE id = ?', [id])
}

export function clearCompleted(): void {
  getDb().runSync('DELETE FROM pending_changes WHERE status = ?', [
    'completed',
  ])
}

function rowToChange(r: Record<string, any>): PendingChange {
  return {
    id: r.id,
    tableName: r.table_name,
    recordId: r.record_id,
    operation: r.operation as SyncOperation,
    payload: r.payload,
    status: r.status as PendingChange['status'],
    retryCount: r.retry_count,
    createdAt: r.created_at,
  }
}
