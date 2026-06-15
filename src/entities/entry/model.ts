export type EntryType = "income" | "expense" | "saving";
export type PaymentMethod = "cash" | "card" | "account" | "transfer";

export interface Entry {
  id: string;
  userId: string;
  familyId?: string;
  categoryId?: string;
  amount: number;
  type: EntryType;
  paymentMethod?: PaymentMethod;
  note?: string;
  date: string;
  photoUrls?: string[];
  isShared: boolean;
  isRecurring: boolean;
  recurringRule?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
export type UpdateEntryInput = Partial<Omit<Entry, "id" | "createdAt">>;
