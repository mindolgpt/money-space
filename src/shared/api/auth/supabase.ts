import { supabase } from '@/shared/api/supabase'

type AuthSession = {
  access_token: string
  refresh_token: string
}

type AuthResult = {
  user: {
    id: string
    email: string
    user_metadata: { name?: string }
  } | null
  session: AuthSession | null
}

export function createAuthApi() {
  return {
    signUp: async (
      email: string,
      password: string,
      name: string,
    ): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error
      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email!,
              user_metadata: { name },
            }
          : null,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
      }
    },

    signIn: async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email!,
              user_metadata: data.user.user_metadata ?? {},
            }
          : null,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
      }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },

    getUser: async (
      token?: string,
    ): Promise<{
      user: {
        id: string
        email: string
        user_metadata: { name?: string }
      } | null
    }> => {
      const { data } = await supabase.auth.getUser(token)
      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email!,
              user_metadata: data.user.user_metadata ?? {},
            }
          : null,
      }
    },
  }
}
