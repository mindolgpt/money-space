import { supabase } from "../../shared/api/supabase";
import { Entry, CreateEntryInput, UpdateEntryInput } from "./model";

export async function fetchEntriesFromSupabase(userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .or(`user_id.eq.${userId},is_shared.true`);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function upsertEntryToSupabase(entry: Entry): Promise<void> {
  const { error } = await supabase.from("entries").upsert({
    id: entry.id,
    user_id: entry.userId,
    family_id: entry.familyId,
    category_id: entry.categoryId,
    amount: entry.amount,
    type: entry.type,
    payment_method: entry.paymentMethod,
    note: entry.note,
    date: entry.date,
    photo_urls: entry.photoUrls,
    is_shared: entry.isShared,
    is_recurring: entry.isRecurring,
    recurring_rule: entry.recurringRule,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteEntryFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
}

function mapRow(row: any): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    categoryId: row.category_id,
    amount: row.amount,
    type: row.type,
    paymentMethod: row.payment_method,
    note: row.note,
    date: row.date,
    photoUrls: row.photo_urls,
    isShared: row.is_shared,
    isRecurring: row.is_recurring,
    recurringRule: row.recurring_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
