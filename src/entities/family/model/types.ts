export type FamilyRole = 'admin' | 'member' | 'viewer'

export type Family = {
  id: string
  name: string
  createdAt: string
  inviteCode?: string
}

export type FamilyMember = {
  id: string
  familyId: string
  userId: string
  role: FamilyRole
  joinedAt: string
  userEmail?: string
  userName?: string
}

export type CreateFamilyInput = {
  name: string
  userId: string
}

export type UpdateMemberRoleInput = {
  familyId: string
  userId: string
  role: FamilyRole
}

export type RemoveMemberInput = {
  familyId: string
  userId: string
}

export type JoinByCodeInput = {
  inviteCode: string
  userId: string
}
