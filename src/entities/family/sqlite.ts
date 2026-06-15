import { getDb } from "../../shared/lib/db";
import { Family, FamilyMember } from "./model";

export function insertFamily(family: Family): void {
  getDb().runSync(
    "INSERT OR REPLACE INTO families (id, name, created_at) VALUES (?, ?, ?)",
    [family.id, family.name, family.createdAt]
  );
}

export function insertFamilyMember(member: FamilyMember): void {
  getDb().runSync(
    "INSERT OR REPLACE INTO family_members (id, family_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)",
    [member.id, member.familyId, member.userId, member.role, member.joinedAt]
  );
}

export function getFamilyByUserId(userId: string): Family | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    `SELECT f.* FROM families f
     JOIN family_members fm ON f.id = fm.family_id
     WHERE fm.user_id = ?`,
    [userId]
  );
  if (!row) return null;
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function getFamilyMembers(familyId: string): FamilyMember[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM family_members WHERE family_id = ?",
    [familyId]
  );
  return rows.map((r) => ({
    id: r.id,
    familyId: r.family_id,
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
  }));
}
