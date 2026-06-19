import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateId } from '@/shared/lib/uuid'
import * as entrySqlite from '@/shared/api/entry'
import { createEntryApi as createRemoteEntryApi } from '@/shared/api/entry'
import {
  createEntryLocally,
} from '@/entities/entry/model/create-entry-locally'
import {
  modifyEntryLocally,
} from '@/entities/entry/model/modify-entry-locally'
import {
  removeEntryLocally,
} from '@/entities/entry/model/remove-entry-locally'
import type { Entry, CreateEntryInput, UpdateEntryInput } from '@/entities/entry/model/types'

export const ENTRY_KEYS = {
  all: () => ['entries'] as const,
  lists: () => [...ENTRY_KEYS.all(), 'list'] as const,
  list: (userId: string, year: number, month: number) =>
    [...ENTRY_KEYS.lists(), userId, year, month] as const,
  details: () => [...ENTRY_KEYS.all(), 'detail'] as const,
  detail: (id: string) => [...ENTRY_KEYS.details(), id] as const,
  remote: (userId: string) => [...ENTRY_KEYS.all(), 'remote', userId] as const,
  search: (userId: string, query: string) =>
    [...ENTRY_KEYS.all(), 'search', { userId, query }] as const,
  family: (familyId: string) => [...ENTRY_KEYS.all(), 'family', familyId] as const,
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
      getByDateRange: entrySqlite.getEntriesByDateRange,
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

export function useSearchEntries(userId: string, query: string) {
  return useQuery({
    queryKey: ENTRY_KEYS.search(userId, query),
    queryFn: () => entrySqlite.searchEntries(userId, query),
    enabled: query.trim().length > 0,
  })
}

export function useFamilyEntries(familyId: string | undefined) {
  return useQuery({
    queryKey: ENTRY_KEYS.family(familyId ?? ''),
    queryFn: () => entrySqlite.getEntriesByFamilyId(familyId!),
    enabled: !!familyId,
    staleTime: 1000 * 60,
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEntryInput) => Promise.resolve(createEntryLocally(input)),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ENTRY_KEYS.all() })
      const dateParts = input.date.split('-')
      const year = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10)
      const key = ENTRY_KEYS.list(input.userId, year, month)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      const optimisticEntry: Entry = {
        ...input,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData(key, (old: Entry[] | undefined) =>
        old ? [optimisticEntry, ...old] : [optimisticEntry],
      )
      return { previous, key, optimisticEntry }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous)
      }
    },
    onSettled: (_data, _err, input) => {
      const dateParts = input.date.split('-')
      const year = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10)
      queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.list(input.userId, year, month) })
    },
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEntryInput }) => {
      modifyEntryLocally(id, input as Record<string, any>)
      return Promise.resolve(entrySqlite.getEntryById(id))
    },
    onSuccess: (entry) => {
      if (entry) {
        queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
        queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.detail(entry.id) })
      }
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(removeEntryLocally(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
    },
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