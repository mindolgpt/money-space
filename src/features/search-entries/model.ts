import { create } from "zustand";
import { getDb } from "../../shared/lib/db";
import { Entry } from "../../entities/entry";

interface SearchState {
  results: Entry[];
  query: string;
  search: (q: string) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  query: "",

  search: (query) => {
    const db = getDb();
    const rows = db.getAllSync<Record<string, any>>(
      "SELECT * FROM entries WHERE note LIKE ? OR CAST(amount AS TEXT) LIKE ? ORDER BY date DESC LIMIT 50",
      [`%${query}%`, `%${query}%`]
    );
    set({
      query,
      results: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        amount: r.amount,
        type: r.type,
        date: r.date,
        note: r.note,
        categoryId: r.category_id,
        paymentMethod: r.payment_method,
        photoUrls: r.photo_urls,
        isShared: Boolean(r.is_shared),
        isRecurring: Boolean(r.is_recurring),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  },

  clear: () => set({ results: [], query: "" }),
}));
