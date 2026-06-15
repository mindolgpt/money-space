import { enqueueChange } from "../../entities/sync-queue";
import { Entry, CreateEntryInput } from "../../entities/entry";
import { insertEntry, updateEntry, deleteEntry } from "../../entities/entry/sqlite";

export function createEntryLocally(input: CreateEntryInput): Entry {
  const entry = insertEntry(input);
  enqueueChange("entries", entry.id, "insert", entry);
  return entry;
}

export function modifyEntryLocally(id: string, changes: Record<string, any>): Entry | null {
  const entry = updateEntry(id, changes);
  if (entry) {
    enqueueChange("entries", id, "update", entry);
  }
  return entry;
}

export function removeEntryLocally(id: string): void {
  deleteEntry(id);
  enqueueChange("entries", id, "delete", { id });
}
