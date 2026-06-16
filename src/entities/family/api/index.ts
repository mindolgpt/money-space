import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as familySqlite from '@/shared/api/family'
import { createFamilyApi as createRemoteFamilyApi } from '@/shared/api/family/supabase'

export const FAMILY_KEYS = {
  all: () => ['family'] as const,
  detail: (userId: string) => [...FAMILY_KEYS.all(), userId] as const,
}

export function createFamilyApi() {
  return {
    remote: createRemoteFamilyApi(),
    local: {
      insert: familySqlite.insertFamily,
      insertMember: familySqlite.insertFamilyMember,
      getByUserId: familySqlite.getFamilyByUserId,
      getMembers: familySqlite.getFamilyMembers,
    },
  }
}

export function useFamily(userId: string | undefined) {
  return useQuery({
    queryKey: FAMILY_KEYS.detail(userId!),
    queryFn: () => familySqlite.getFamilyByUserId(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, userId }: { name: string; userId: string }) =>
      createRemoteFamilyApi().create(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}

export function useInviteByEmail() {
  return useMutation({
    mutationFn: ({ email, familyId }: { email: string; familyId: string }) =>
      createRemoteFamilyApi().inviteByEmail(email, familyId),
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) =>
      createRemoteFamilyApi().acceptInvite(code, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}
