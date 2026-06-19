import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createAuthApi } from '@/shared/api/auth'
import {
  createUserApi as createRemoteUserApi,
  getLocalSettings,
  upsertLocalSettings,
  getDefaultSettings,
} from '@/shared/api/user'
import { supabase } from '@/shared/api/supabase'
import type { AuthUser ,
  UserProfile,
  UserSettings,
} from '@/entities/user/model/types'

export { getLocalSettings, upsertLocalSettings, getDefaultSettings }

export const AUTH_KEYS = {
  user: () => ['auth', 'user'] as const,
  session: () => ['auth', 'session'] as const,
}

export const USER_KEYS = {
  profile: () => ['user', 'profile'] as const,
  settings: () => ['user', 'settings'] as const,
}

const authApi = createAuthApi()
const remoteUserApi = createRemoteUserApi()

export function createUserApi() {
  return {
    remote: authApi,
  }
}

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user(),
    queryFn: async (): Promise<AuthUser | null> => {
      const result = await authApi.getUser()
      if (!result.user) return null
      return {
        id: result.user.id,
        email: result.user.email,
        name: result.user.user_metadata?.name,
      }
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }): Promise<AuthUser> => {
      const result = await authApi.signIn(email, password)
      if (!result.user) throw new Error('로그인에 실패했습니다')
      return {
        id: result.user.id,
        email: result.user.email,
        name: result.user.user_metadata?.name,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() })
    },
  })
}

export function useSignUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string
      password: string
      name?: string
    }): Promise<AuthUser> => {
      const result = await authApi.signUp(email, password, name ?? '')
      if (!result.user) throw new Error('회원가입에 실패했습니다')
      return {
        id: result.user.id,
        email: result.user.email,
        name: name || result.user.user_metadata?.name,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() })
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await authApi.signOut()
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user(), null)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await authApi.resetPassword(email)
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      await authApi.updatePassword(newPassword)
    },
  })
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: USER_KEYS.profile(),
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null
      return remoteUserApi.getProfile(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>
    }) => {
      await remoteUserApi.updateProfile(userId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile() })
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() })
    },
  })
}

export function useUserSettings(userId: string | undefined) {
  return useQuery({
    queryKey: USER_KEYS.settings(),
    queryFn: async (): Promise<UserSettings> => {
      if (!userId) {
        return { userId: '', ...getDefaultSettings() }
      }
      const local = getLocalSettings(userId)
      if (local) return local
      const remote = await remoteUserApi.getSettings(userId)
      upsertLocalSettings(remote)
      return remote
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Omit<UserSettings, 'userId'>>
    }) => {
      await remoteUserApi.updateSettings(userId, updates)
      const current = queryClient.getQueryData<UserSettings>(USER_KEYS.settings())
      if (current) {
        upsertLocalSettings({ ...current, ...updates } as UserSettings)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.settings() })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await remoteUserApi.deleteAccount(userId)
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user(), null)
      queryClient.removeQueries({ queryKey: USER_KEYS.profile() })
      queryClient.removeQueries({ queryKey: USER_KEYS.settings() })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      uri,
    }: {
      userId: string
      uri: string
    }): Promise<string | null> => {
      const response = await fetch(uri)
      const blob = await response.blob()
      const filename = `${userId}-${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, blob, { contentType: 'image/jpeg' })

      if (uploadError) return null

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
      return urlData.publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile() })
    },
  })
}
