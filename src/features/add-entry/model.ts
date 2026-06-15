import { create } from "zustand";

interface EntryFormState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useEntryFormStore = create<EntryFormState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
