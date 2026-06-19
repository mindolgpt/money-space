import { getDb } from '@/shared/lib'
import type { Family, FamilyMember, FamilyRole } from '@/entities/family'

export function insertFamily(family: Family): void {
  getDb().runSync(
    'INSERT OR REPLACE INTO families (id, name, created_at, invite_code) VALUES (?, ?, ?, ?)',
    [family.id, family.name, family.createdAt, family.inviteCode ?? null],
  )
}

export function insertFamilyMember(member: FamilyMember): void {
  getDb().runSync(
    'INSERT OR REPLACE INTO family_members (id, family_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)',
    [member.id, member.familyId, member.userId, member.role, member.joinedAt],
  )
}

export function getFamilyById(id: string): Family | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    'SELECT * FROM families WHERE id = ?',
    [id],
  )
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    inviteCode: row.invite_code ?? undefined,
  }
}

export function getFamilyByUserId(userId: string): Family | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    `SELECT f.* FROM families f
     JOIN family_members fm ON f.id = fm.family_id
     WHERE fm.user_id = ?`,
    [userId],
  )
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    inviteCode: row.invite_code ?? undefined,
  }
}

export function getAllFamiliesForUser(userId: string): Family[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    `SELECT f.* FROM families f
     JOIN family_members fm ON f.id = fm.family_id
     WHERE fm.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId],
  )
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    inviteCode: r.invite_code ?? undefined,
  }))
}

export function getFamilyMembers(familyId: string): FamilyMember[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    'SELECT * FROM family_members WHERE family_id = ?',
    [familyId],
  )
  return rows.map((r) => ({
    id: r.id,
    familyId: r.family_id,
    userId: r.user_id,
    role: r.role as FamilyRole,
    joinedAt: r.joined_at,
  }))
}

export function updateFamily(id: string, name: string): void {
  getDb().runSync('UPDATE families SET name = ? WHERE id = ?', [name, id])
}

export function deleteFamily(id: string): void {
  getDb().runSync('DELETE FROM family_members WHERE family_id = ?', [id])
  getDb().runSync('DELETE FROM families WHERE id = ?', [id])
}

export function deleteFamilyMember(familyId: string, userId: string): void {
  getDb().runSync(
    'DELETE FROM family_members WHERE family_id = ? AND user_id = ?',
    [familyId, userId],
  )
}

export function updateMemberRole(
  familyId: string,
  userId: string,
  role: FamilyRole,
): void {
  getDb().runSync(
    'UPDATE family_members SET role = ? WHERE family_id = ? AND user_id = ?',
    [role, familyId, userId],
  )
}

export function saveInviteCode(familyId: string, code: string): void {
  getDb().runSync('UPDATE families SET invite_code = ? WHERE id = ?', [
    code,
    familyId,
  ])
}
