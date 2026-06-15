export interface Family {
  id: string;
  name: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: string;
  joinedAt: string;
  userEmail?: string;
  userName?: string;
}
