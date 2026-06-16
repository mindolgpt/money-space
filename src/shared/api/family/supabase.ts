import { supabase } from '@/shared/api/supabase'

export function createFamilyApi() {
  return {
    create: async (name: string, userId: string) => {
      const { data: family, error: fErr } = await supabase
        .from('families')
        .insert({ name })
        .select()
        .single()
      if (fErr) throw fErr

      await supabase.from('family_members').insert({
        family_id: family.id,
        user_id: userId,
        role: 'owner',
      })

      return {
        id: family.id,
        name: family.name,
        createdAt: family.created_at,
      }
    },

    inviteByEmail: async (email: string, familyId: string) => {
      const { error } = await supabase.functions.invoke('send-invite', {
        body: { email, familyId },
      })
      if (error) throw error
    },

    acceptInvite: async (inviteCode: string, userId: string) => {
      const { data: invite, error: iErr } = await supabase
        .from('invites')
        .select('*')
        .eq('code', inviteCode)
        .single()
      if (iErr) throw new Error('Invalid invite code')

      await supabase.from('family_members').insert({
        family_id: invite.family_id,
        user_id: userId,
        role: 'member',
      })
    },
  }
}
