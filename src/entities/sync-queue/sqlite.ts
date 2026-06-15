import { getDb } from "../../shared/lib/db";
import { PendingChange } from "./model";

export function enqueueChange(
  tableName: string,
  recordId: string,
  operation: string,
  payload: Record<string, any>
): void {
  getDb().runSync(
    `INSERT INTO pending_changes (table_name, record_id, operation, payload, status, retry_count)
     VALUES (?, ?, ?, ?, 'pending', 0)`,
    [tableName, recordId, operation, JSON.stringify(payload)]
  );
}

export function getPendingChanges(): PendingChange[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM pending_changes WHERE status = 'pending' ORDER BY created_at ASC"
  );
  return rows.map((r) => ({
    id: r.id,
    tableName: r.table_name,
    recordId: r.record_id,
    operation: r.operation,
    payload: r.payload,
    status: r.status,
    retryCount: r.retry_count,
    createdAt: r.created_at,
  }));
}

export function markChangeDone(id: number): void {
  getDb().runSync("DELETE FROM pending_changes WHERE id = ?", [id]);
}

export function markChangeFailed(id: number): void {
  getDb().runSync(
    "UPDATE pending_changes SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?",
    [id]
  );
}
