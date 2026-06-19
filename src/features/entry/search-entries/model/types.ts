import { Entry } from '@/entities/entry'

type SearchState = {
  results: Entry[]
  query: string
  search: (q: string) => void
  clear: () => void
}

export type { SearchState }