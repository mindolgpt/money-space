import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as entrySqlite from '@/shared/api/entry'
import { createEntryApi as createRemoteEntryApi } from '@/shared/api/entry/supabase'

export const ENTRY_KEYS = {
  all: () => ['entries'] as const,
  lists: () => [...ENTRY_KEYS.all(), 'list'] as const,
  list: (userId: string, year: number, month: number) =>
    [...ENTRY_KEYS.lists(), userId, year, month] as const,
  details: () => [...ENTRY_KEYS.all(), 'detail'] as const,
  detail: (id: string) => [...ENTRY_KEYS.details(), id] as const,
  remote: (userId: string) => [...ENTRY_KEYS.all(), 'remote', userId] as const,
}

export function createEntryApi() {
  return {
    remote: createRemoteEntryApi(),
    local: {
      insert: entrySqlite.insertEntry,
      getById: entrySqlite.getEntryById,
      getByMonth: entrySqlite.getEntriesByMonth,
      update: entrySqlite.updateEntry,
      delete: entrySqlite.deleteEntry,
      search: entrySqlite.searchEntries,
      upsertFromRemote: entrySqlite.upsertEntryFromRemote,
    },
  }
}

export function useEntries(userId: string, year: number, month: number) {
  return useQuery({
    queryKey: ENTRY_KEYS.list(userId, year, month),
    queryFn: () => entrySqlite.getEntriesByMonth(userId, year, month),
    staleTime: Infinity,
  })
}

export function useEntry(id: string | undefined) {
  return useQuery({
    queryKey: ENTRY_KEYS.detail(id!),
    queryFn: () => entrySqlite.getEntryById(id!),
    enabled: !!id,
    staleTime: Infinity,
  })
}

export function useRemoteEntries(userId: string) {
  return useQuery({
    queryKey: ENTRY_KEYS.remote(userId),
    queryFn: () => createRemoteEntryApi().fetchAll(userId),
    enabled: !!userId,
  })
}

export function useUpsertEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entry: any) => createRemoteEntryApi().upsert(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => createRemoteEntryApi().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
    },
  })
}
