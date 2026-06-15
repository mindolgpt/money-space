import { supabase } from "../../shared/api/supabase";
import { getDb } from "../../shared/lib/db";
import { useAuthStore } from "../auth";

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

export function subscribeToRealtime() {
  const user = useAuthStore.getState().user;
  if (!user) return null;

  const subscription = supabase
    .channel("entries-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "entries",
        filter: `user_id=eq.${user.id}`,
      },
      (payload: RealtimePayload) => {
        handleEntryChange(payload);
      }
    )
    .subscribe();

  return subscription;
}

function handleEntryChange(payload: RealtimePayload) {
  const db = getDb();

  if (payload.eventType === "DELETE") {
    db.runSync("DELETE FROM entries WHERE id = ?", [payload.old.id]);
  } else {
    const row = payload.new;
    db.runSync(
      `INSERT OR REPLACE INTO entries
       (id, user_id, family_id, category_id, amount, type, payment_method, note, date, photo_urls, is_shared, is_recurring, recurring_rule, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id, row.user_id, row.family_id, row.category_id,
        row.amount, row.type, row.payment_method, row.note, row.date,
        row.photo_urls ? JSON.stringify(row.photo_urls) : null,
        row.is_shared ? 1 : 0, row.is_recurring ? 1 : 0,
        row.recurring_rule, row.created_at, row.updated_at,
      ]
    );
  }
}
