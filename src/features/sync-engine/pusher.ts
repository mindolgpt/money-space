import { getPendingChanges, markChangeDone, markChangeFailed } from "../../entities/sync-queue";
import { getDb } from "../../shared/lib/db";
import { upsertEntryToSupabase, deleteEntryFromSupabase } from "../../entities/entry/supabase";
import { SYNC_RETRY_MAX } from "../../shared/config/constants";

export async function pushPendingChanges(): Promise<void> {
  const changes = getPendingChanges();

  for (const change of changes) {
    try {
      const payload = JSON.parse(change.payload);

      switch (change.tableName) {
        case "entries":
          if (change.operation === "delete") {
            await deleteEntryFromSupabase(change.recordId);
          } else {
            await upsertEntryToSupabase(payload);
          }
          break;
      }

      markChangeDone(change.id!);
    } catch (error) {
      if (change.retryCount >= SYNC_RETRY_MAX) {
        markChangeFailed(change.id!);
      } else {
        getDb().runSync(
          "UPDATE pending_changes SET retry_count = retry_count + 1 WHERE id = ?",
          [change.id!]
        );
      }
    }
  }
}
