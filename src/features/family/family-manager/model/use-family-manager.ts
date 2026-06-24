import { useState, useCallback } from 'react'
import { Alert, Share } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import {
  useFamilies,
  useFamilyMembers,
  useLeaveFamily,
  useRemoveMember,
  useUpdateMemberRole,
  useGenerateInviteCode,
} from '@/entities/family'
import { useFamilyEntries } from '@/entities/entry'
import type { Family, FamilyMember, FamilyRole } from '@/entities/family'

const ROLE_LABELS: Record<FamilyRole, string> = {
  admin: '관리자',
  member: '멤버',
  viewer: '뷰어',
}

export function useFamilyManager(onClose?: () => void) {
  const { user } = useAuthStore()
  const { data: families = [] } = useFamilies(user?.id)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const { data: members = [] } = useFamilyMembers(selectedFamilyId ?? undefined)
  const { data: familyEntries = [] } = useFamilyEntries(selectedFamilyId ?? undefined)
  const { mutateAsync: leaveFamily } = useLeaveFamily()
  const { mutateAsync: removeMember } = useRemoveMember()
  const { mutateAsync: updateRole } = useUpdateMemberRole()
  const { mutateAsync: generateCode } = useGenerateInviteCode()

  const selectedFamily = families.find((f) => f.id === selectedFamilyId) ?? null
  const currentMember = members.find((m) => m.userId === user?.id)
  const isAdmin = currentMember?.role === 'admin'

  const onFamilySelect = useCallback((family: Family) => {
    setSelectedFamilyId(family.id)
  }, [])

  const onShareInvite = useCallback(async () => {
    if (!selectedFamily) return
    let code = selectedFamily.inviteCode
    if (!code) {
      code = await generateCode(selectedFamily.id)
    }
    await Share.share({
      message: `${user?.email?.split('@')[0] ?? ''}님이 Money-Space 가족 초대를 보냈습니다.\n초대 코드: ${code}\n\n앱에서 코드를 입력하여 참여하세요!`,
      title: '가족 초대',
    })
  }, [selectedFamily, generateCode, user])

  const onCopyCode = useCallback(async () => {
    if (!selectedFamily) return
    let code = selectedFamily.inviteCode
    if (!code) {
      code = await generateCode(selectedFamily.id)
    }
    Alert.alert('초대 코드', code)
  }, [selectedFamily, generateCode])

  const onLeave = useCallback(() => {
    if (!selectedFamily || !user) return
    Alert.alert(
      '가족 탈퇴',
      '정말 이 가족에서 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => leaveFamily({ familyId: selectedFamily.id, userId: user.id }),
        },
      ],
    )
  }, [selectedFamily, user, leaveFamily])

  const onRemoveMember = useCallback((member: FamilyMember) => {
    if (!selectedFamily || member.userId === user?.id) {
      Alert.alert('알림', '본인은 추방할 수 없습니다')
      return
    }
    Alert.alert(
      '멤버 삭제',
      `${member.userName ?? member.userId}님을 가족에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => removeMember({ familyId: selectedFamily.id, userId: member.userId }),
        },
      ],
    )
  }, [selectedFamily, user, removeMember])

  const onRoleChange = useCallback((member: FamilyMember, newRole: FamilyRole) => {
    if (!selectedFamily) return
    if (member.userId === user?.id) {
      Alert.alert('알림', '본인의 역할은 변경할 수 없습니다')
      return
    }
    Alert.alert(
      '역할 변경',
      `${member.userName ?? member.userId}의 역할을 "${ROLE_LABELS[newRole]}"(으)로 변경하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: () => updateRole({ familyId: selectedFamily.id, userId: member.userId, role: newRole }),
        },
      ],
    )
  }, [selectedFamily, user, updateRole])

  return {
    families,
    selectedFamilyId,
    selectedFamily,
    members,
    familyEntries,
    currentMember,
    isAdmin,
    showCreateModal,
    showJoinModal,
    onFamilySelect,
    onShareInvite,
    onCopyCode,
    onLeave,
    onRemoveMember,
    onRoleChange,
    setShowCreateModal,
    setShowJoinModal,
  }
}
