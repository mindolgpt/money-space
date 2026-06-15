export type SyncOperation = "insert" | "update" | "delete";
export type SyncStatus = "pending" | "processing" | "failed";

export interface PendingChange {
  id?: number;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: string;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
}
