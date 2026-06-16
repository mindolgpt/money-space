import { create } from 'zustand'
import { createEntryApi } from '@/entities/entry'
import type { SearchState } from '@/features/entry/search-entries/model/types'

export const useSearchStore = create<SearchState>((set) => ({
  results: [],

  query: '',

  search: (query) => {
    const entryApi = createEntryApi()
    const results = entryApi.local.search(query)
    set({ query, results })
  },

  clear: () => set({ results: [], query: '' }),
}))
