import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, Share } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useFamilies, useFamilyMembers, useLeaveFamily, useRemoveMember, useUpdateMemberRole, useGenerateInviteCode } from '@/entities/family'
import { useFamilyEntries } from '@/entities/entry'
import type { Family, FamilyMember, FamilyRole } from '@/entities/family'
import { CreateFamilyModal , JoinFamilyModal } from '@/features/family/family-modal'

type Props = {
  onClose?: () => void
}

const ROLE_LABELS: Record<FamilyRole, string> = {
  admin: '관리자',
  member: '멤버',
  viewer: '뷰어',
}

export function FamilyManager({ onClose }: Props) {
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

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-subtle">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-accent-blue text-base">닫기</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary">가족 관리</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Action Buttons */}
      <View className="flex-row px-4 py-3 gap-3">
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl bg-accent-blue items-center"
          onPress={() => setShowCreateModal(true)}
        >
          <Text className="text-white font-medium text-sm">가족 생성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl bg-bg-tertiary items-center"
          onPress={() => setShowJoinModal(true)}
        >
          <Text className="text-secondary font-medium text-sm">초대 코드 입력</Text>
        </TouchableOpacity>
      </View>

      {/* Family List */}
      <FlatList
        data={families}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListHeaderComponent={
          <Text className="text-sm text-secondary mb-2">내 가족</Text>
        }
        renderItem={({ item }) => (
          <FamilyCard
            family={item}
            isSelected={item.id === selectedFamilyId}
            onPress={() => onFamilySelect(item)}
          />
        )}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-tertiary">가족이 없습니다</Text>
            <Text className="text-xs text-tertiary mt-1">
              가족을 생성하거나 초대 코드를 입력하세요
            </Text>
          </View>
        }
      />

      {/* Selected Family Details */}
      {selectedFamily && (
        <View className="px-4 mt-4">
          {/* Invite Section */}
          {isAdmin && (
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="flex-1 py-2.5 rounded-xl bg-accent-blue/10 items-center"
                onPress={onCopyCode}
              >
                <Text className="text-accent-blue text-sm font-medium">코드 보기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-2.5 rounded-xl bg-accent-blue/10 items-center"
                onPress={onShareInvite}
              >
                <Text className="text-accent-blue text-sm font-medium">초대 공유</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Members Section */}
          <Text className="text-sm text-secondary mb-2">
            멤버 ({members.length})
          </Text>
          {members.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              isSelf={member.userId === user?.id}
              onRemove={() => onRemoveMember(member)}
              onRoleChange={(role) => onRoleChange(member, role)}
            />
          ))}

          {/* Shared Transactions Section */}
          <Text className="text-sm text-secondary mb-2 mt-4">
            공유 거래 ({familyEntries.length})
          </Text>
          {familyEntries.length === 0 ? (
            <View className="py-4 items-center">
              <Text className="text-tertiary text-sm">공유된 거래가 없습니다</Text>
            </View>
          ) : (
            familyEntries.slice(0, 10).map((entry) => (
              <View
                key={entry.id}
                className="flex-row items-center justify-between py-2.5 px-3 rounded-xl bg-bg-secondary mb-1.5"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-secondary">
                      {entry.date}
                    </Text>
                    <View className={`px-1.5 py-0.5 rounded ${
                      entry.type === 'income' ? 'bg-accent-green/20' :
                      entry.type === 'expense' ? 'bg-accent-red/20' :
                      'bg-accent-blue/20'
                    }`}>
                      <Text className={`text-xs ${
                        entry.type === 'income' ? 'text-accent-green' :
                        entry.type === 'expense' ? 'text-accent-red' :
                        'text-accent-blue'
                      }`}>
                        {entry.type === 'income' ? '수입' : entry.type === 'expense' ? '지출' : '저축'}
                      </Text>
                    </View>
                  </View>
                  {entry.note && (
                    <Text className="text-sm text-primary mt-0.5" numberOfLines={1}>
                      {entry.note}
                    </Text>
                  )}
                </View>
                <Text className={`text-sm font-medium ml-2 ${
                  entry.type === 'income' ? 'amount-income' : 'amount-expense'
                }`}>
                  {entry.type === 'income' ? '+' : '-'}₩{entry.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}

          {/* Leave Button */}
          <TouchableOpacity
            className="py-3 items-center mt-4"
            onPress={onLeave}
          >
            <Text className="text-accent-red text-sm font-medium">가족 탈퇴</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCreateModal && (
        <CreateFamilyModal onClose={() => setShowCreateModal(false)} />
      )}
      {showJoinModal && (
        <JoinFamilyModal onClose={() => setShowJoinModal(false)} />
      )}
    </View>
  )
}

type FamilyCardProps = {
  family: Family
  isSelected: boolean
  onPress: () => void
}

function FamilyCard({ family, isSelected, onPress }: FamilyCardProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center py-3 px-4 rounded-xl mb-2 ${
        isSelected ? 'bg-accent-blue/10 border border-accent-blue/30' : 'bg-bg-secondary'
      }`}
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-accent-purple/20 items-center justify-center mr-3">
        <Text className="text-lg">👨‍👩‍👧</Text>
      </View>
      <View className="flex-1">
        <Text className="font-medium text-primary">{family.name}</Text>
        <Text className="text-xs text-tertiary">
          {family.inviteCode ? `초대코드: ${family.inviteCode}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

type MemberItemProps = {
  member: FamilyMember
  isAdmin: boolean
  isSelf: boolean
  onRemove: () => void
  onRoleChange: (role: FamilyRole) => void
}

const ROLE_LABELS_MAP: Record<FamilyRole, string> = {
  admin: '관리자',
  member: '멤버',
  viewer: '뷰어',
}

function MemberItem({ member, isAdmin, isSelf, onRemove, onRoleChange }: MemberItemProps) {
  return (
    <View className="flex-row items-center py-2.5 px-3 rounded-xl bg-bg-secondary mb-1.5">
      <View className="w-8 h-8 rounded-full bg-accent-blue/20 items-center justify-center mr-3">
        <Text className="text-sm">{isSelf ? '👤' : '👥'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-primary">
          {member.userName ?? member.userEmail ?? member.userId.slice(0, 8)}
          {isSelf ? ' (나)' : ''}
        </Text>
        <View className="flex-row items-center gap-1">
          <View className={`px-2 py-0.5 rounded-full ${member.role === 'admin' ? 'bg-accent-purple/20' : member.role === 'viewer' ? 'bg-accent-orange/20' : 'bg-accent-blue/20'}`}>
            <Text className={`text-xs ${member.role === 'admin' ? 'text-accent-purple' : member.role === 'viewer' ? 'text-accent-orange' : 'text-accent-blue'}`}>
              {ROLE_LABELS_MAP[member.role]}
            </Text>
          </View>
        </View>
      </View>
      {isAdmin && !isSelf && (
        <View className="flex-row gap-1">
          <TouchableOpacity
            className="w-7 h-7 rounded-full bg-accent-blue/10 items-center justify-center"
            onPress={onRemove}
          >
            <Text className="text-accent-red text-xs">✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}