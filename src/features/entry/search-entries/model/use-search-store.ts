import { create } from 'zustand'
import type { SearchState } from '@/features/entry/search-entries/model/types'

export const useSearchStore = create<SearchState>((set) => ({
  results: [],

  query: '',

  search: (_query: string) => {
    // deprecated: SearchSheet now uses useSearchEntries hook directly
  },

  clear: () => set({ results: [], query: '' }),
}))