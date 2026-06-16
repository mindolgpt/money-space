export type Family = {
  id: string
  name: string
  createdAt: string
}

export type FamilyMember = {
  id: string
  familyId: string
  userId: string
  role: string
  joinedAt: string
  userEmail?: string
  userName?: string
}
