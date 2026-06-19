import { supabase } from '@/shared/api/supabase'
import type {
  Family,
  FamilyMember,
  FamilyRole,
} from '@/entities/family'

export function createFamilyApi() {
  return {
    create: async (name: string, userId: string): Promise<Family> => {
      const { data: family, error: fErr } = await supabase
        .from('families')
        .insert({ name })
        .select()
        .single()
      if (fErr) throw fErr

      const { error: mErr } = await supabase.from('family_members').insert({
        family_id: family.id,
        user_id: userId,
        role: 'admin',
      })
      if (mErr) throw mErr

      return {
        id: family.id,
        name: family.name,
        createdAt: family.created_at,
      }
    },

    update: async (id: string, name: string): Promise<void> => {
      const { error } = await supabase
        .from('families')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },

    delete: async (id: string): Promise<void> => {
      const { error: fmErr } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', id)
      if (fmErr) throw fmErr

      const { error } = await supabase.from('families').delete().eq('id', id)
      if (error) throw error
    },

    generateInviteCode: async (familyId: string): Promise<string> => {
      const code = generateCode()
      const { error } = await supabase
        .from('family_invites')
        .insert({
          family_id: familyId,
          code,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        })
      if (error) throw error
      return code
    },

    joinByCode: async (
      inviteCode: string,
      userId: string,
    ): Promise<FamilyMember> => {
      const { data: invite, error: iErr } = await supabase
        .from('family_invites')
        .select('*')
        .eq('code', inviteCode)
        .single()
      if (iErr) throw new Error('INVALID_CODE')

      if (new Date(invite.expires_at) < new Date()) {
        throw new Error('CODE_EXPIRED')
      }

      const { data: existing } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', invite.family_id)
        .eq('user_id', userId)
        .single()

      if (existing) throw new Error('ALREADY_MEMBER')

      const { data: member, error: mErr } = await supabase
        .from('family_members')
        .insert({
          family_id: invite.family_id,
          user_id: userId,
          role: 'member',
        })
        .select()
        .single()
      if (mErr) throw mErr

      return {
        id: member.id,
        familyId: member.family_id,
        userId: member.user_id,
        role: member.role as FamilyRole,
        joinedAt: member.joined_at,
      }
    },

    validateInviteCode: async (
      code: string,
    ): Promise<{ valid: boolean; family?: Family; adminName?: string; message?: string }> => {
      const { data: invite, error: iErr } = await supabase
        .from('family_invites')
        .select('*, families(name)')
        .eq('code', code)
        .single()

      if (iErr || !invite) {
        return { valid: false, message: '유효하지 않은 코드입니다' }
      }

      if (new Date(invite.expires_at) < new Date()) {
        return { valid: false, message: '코드가 만료되었습니다' }
      }

      const { data: admin } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', invite.family_id)
        .eq('role', 'admin')
        .single()

      return {
        valid: true,
        family: {
          id: invite.family_id,
          name: invite.families?.name ?? '',
          createdAt: invite.created_at,
        },
        adminName: admin?.user_id,
      }
    },

    leave: async (familyId: string, userId: string): Promise<void> => {
      const { count } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('role', 'admin')

      if (count === 1) {
        const { data: member } = await supabase
          .from('family_members')
          .select('user_id')
          .eq('family_id', familyId)
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single()

        if (member) throw new Error('LAST_ADMIN')
      }

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)
      if (error) throw error
    },

    updateMemberRole: async (
      familyId: string,
      userId: string,
      role: FamilyRole,
    ): Promise<void> => {
      const { error } = await supabase
        .from('family_members')
        .update({ role })
        .eq('family_id', familyId)
        .eq('user_id', userId)
      if (error) throw error
    },

    removeMember: async (
      familyId: string,
      userId: string,
    ): Promise<void> => {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)
      if (error) throw error
    },

    listMembers: async (familyId: string): Promise<FamilyMember[]> => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
      if (error) throw error
      return (data ?? []).map((r: any) => ({
        id: r.id,
        familyId: r.family_id,
        userId: r.user_id,
        role: r.role as FamilyRole,
        joinedAt: r.joined_at,
      }))
    },

    inviteByEmail: async (email: string, familyId: string): Promise<void> => {
      const { error } = await supabase.functions.invoke('send-invite', {
        body: { email, familyId },
      })
      if (error) throw error
    },

    listUserFamilies: async (userId: string): Promise<Family[]> => {
      const { data, error } = await supabase
        .from('family_members')
        .select('families(*)')
        .eq('user_id', userId)
      if (error) throw error
      return (data ?? []).map((r: any) => ({
        id: r.families.id,
        name: r.families.name,
        createdAt: r.families.created_at,
      }))
    },
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
