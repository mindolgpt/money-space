import { create } from 'zustand'
import type { EntryFormState } from '@/features/entry/add-entry/model/types'

export const useEntryFormStore = create<EntryFormState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
