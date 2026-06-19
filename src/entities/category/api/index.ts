import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateId } from '@/shared/lib/uuid'
import * as categorySqlite from '@/shared/api/category'
import type { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/types'

export const CATEGORY_KEYS = {
  all: () => ['categories'] as const,
  byType: (type: CategoryType) => ['categories', { type }] as const,
  detail: (id: string) => ['categories', id] as const,
}

export function createCategoryApi() {
  return {
    getByType: categorySqlite.getCategoriesByType,
    getAll: categorySqlite.getAllCategories,
    getById: categorySqlite.getCategoryById,
    create: categorySqlite.createCategoryLocally,
    update: categorySqlite.updateCategoryLocally,
    delete: categorySqlite.deleteCategoryLocally,
    getLastSortOrder: categorySqlite.getLastSortOrder,
    reorder: categorySqlite.reorderCategoriesLocally,
    getLastUsed: categorySqlite.getLastUsedCategory,
    setLastUsed: categorySqlite.setLastUsedCategory,

    remote: {
      fetchByType: categorySqlite.fetchCategoriesByType,
      fetchSystem: categorySqlite.fetchSystemCategories,
      fetchUser: categorySqlite.fetchUserCategories,
      create: categorySqlite.createCategory,
      update: categorySqlite.updateCategory,
      delete: categorySqlite.deleteCategoryRemote,
      reorder: categorySqlite.reorderCategoriesRemote,
    },
  }
}

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: type ? CATEGORY_KEYS.byType(type) : CATEGORY_KEYS.all(),
    queryFn: (): Category[] => {
      const api = createCategoryApi()
      if (type) return api.getByType(type)
      return api.getAll()
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: (): Category | null => {
      const api = createCategoryApi()
      return api.getById(id)
    },
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCategoryInput & { userId?: string }) => {
      const api = createCategoryApi()
      const order = api.getLastSortOrder(input.type) + 1
      const id = generateId()
      const cat = api.create({
        ...input,
        id,
        userId: input.userId ?? '',
        order,
      })
      return cat
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCategoryInput }) => {
      const api = createCategoryApi()
      return api.update(id, input)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(data.id) })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const api = createCategoryApi()
      api.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    },
  })
}

export function useReorderCategories() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const api = createCategoryApi()
      api.reorder(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    },
  })
}

export function useLastUsedCategory(userId: string | undefined, type: CategoryType) {
  return useQuery({
    queryKey: [...CATEGORY_KEYS.all(), 'lastUsed', { userId, type }] as const,
    queryFn: (): Category | null => {
      const api = createCategoryApi()
      return api.getLastUsed(userId!, type)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSetLastUsedCategory() {
  return useMutation({
    mutationFn: ({ userId, type, categoryId }: { userId: string; type: CategoryType; categoryId: string }) => {
      const api = createCategoryApi()
      return Promise.resolve(api.setLastUsed(userId, type, categoryId))
    },
  })
}
