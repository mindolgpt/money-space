import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as familySqlite from '@/shared/api/family'
import { createFamilyApi as createRemoteFamilyApi } from '@/shared/api/family'
import type {
  Family,
  FamilyMember,
  CreateFamilyInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  JoinByCodeInput,
} from '@/entities/family/model/types'

export const FAMILY_KEYS = {
  all: () => ['families'] as const,
  lists: () => ['families', 'list'] as const,
  list: (userId: string) => ['families', 'list', { userId }] as const,
  details: () => ['families', 'detail'] as const,
  detail: (familyId: string) => ['families', 'detail', familyId] as const,
  members: (familyId: string) => ['families', 'members', familyId] as const,
}

export function createFamilyApi() {
  return {
    remote: createRemoteFamilyApi(),
    local: {
      insert: familySqlite.insertFamily,
      insertMember: familySqlite.insertFamilyMember,
      getByUserId: familySqlite.getFamilyByUserId,
      getById: familySqlite.getFamilyById,
      getAllForUser: familySqlite.getAllFamiliesForUser,
      getMembers: familySqlite.getFamilyMembers,
      update: familySqlite.updateFamily,
      delete: familySqlite.deleteFamily,
      deleteMember: familySqlite.deleteFamilyMember,
      updateMemberRole: familySqlite.updateMemberRole,
      saveInviteCode: familySqlite.saveInviteCode,
    },
  }
}

export function useFamily(userId: string | undefined) {
  return useQuery({
    queryKey: FAMILY_KEYS.list(userId!),
    queryFn: (): Family | null => familySqlite.getFamilyByUserId(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useFamilies(userId: string | undefined) {
  return useQuery({
    queryKey: FAMILY_KEYS.list(userId!),
    queryFn: (): Family[] => familySqlite.getAllFamiliesForUser(userId!),
    enabled: !!userId,
  })
}

export function useFamilyMembers(familyId: string | undefined) {
  return useQuery({
    queryKey: FAMILY_KEYS.members(familyId!),
    queryFn: (): FamilyMember[] => familySqlite.getFamilyMembers(familyId!),
    enabled: !!familyId,
  })
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, userId }: CreateFamilyInput): Promise<{ family: Family; inviteCode: string }> => {
      const api = createFamilyApi()
      const family = await api.remote.create(name, userId)
      api.local.insert(family)
      const inviteCode = await api.remote.generateInviteCode(family.id)
      api.local.saveInviteCode(family.id, inviteCode)
      return { family, inviteCode }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}

export function useJoinFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ inviteCode, userId }: JoinByCodeInput) => {
      const api = createFamilyApi()
      const member = await api.remote.joinByCode(inviteCode, userId)
      api.local.insertMember(member)
      return member
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}

export function useLeaveFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ familyId, userId }: RemoveMemberInput) => {
      const api = createFamilyApi()
      await api.remote.leave(familyId, userId)
      api.local.deleteMember(familyId, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ familyId, userId, role }: UpdateMemberRoleInput) => {
      const api = createFamilyApi()
      await api.remote.updateMemberRole(familyId, userId, role)
      api.local.updateMemberRole(familyId, userId, role)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FAMILY_KEYS.members(variables.familyId),
      })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ familyId, userId }: RemoveMemberInput) => {
      const api = createFamilyApi()
      await api.remote.removeMember(familyId, userId)
      api.local.deleteMember(familyId, userId)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FAMILY_KEYS.members(variables.familyId),
      })
    },
  })
}

export function useGenerateInviteCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (familyId: string): Promise<string> => {
      const api = createFamilyApi()
      const code = await api.remote.generateInviteCode(familyId)
      api.local.saveInviteCode(familyId, code)
      return code
    },
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
      createRemoteFamilyApi().joinByCode(code, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })
    },
  })
}
