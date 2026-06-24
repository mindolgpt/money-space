import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { X } from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
import { useFamilyManager } from '../model/use-family-manager'
import type { Family, FamilyMember, FamilyRole } from '@/entities/family'
import { CreateFamilyModal, JoinFamilyModal } from '@/features/family/family-modal'
import { Button } from '@/shared/ui'

type Props = {
  onClose?: () => void
}

export function FamilyManager({ onClose }: Props) {
  const {
    families,
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
  } = useFamilyManager(onClose)

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="ghost" className="text-accent-green" onPress={onClose}>
          닫기
        </Button>
        <Text className="text-headline-md font-bold text-text-primary">가족 관리</Text>
        <View style={{ width: 50 }} />
      </View>

      <View className="flex-row px-4 py-3 gap-3">
        <Button variant="primary" size="md" className="flex-1 self-start" onPress={() => setShowCreateModal(true)}>
          가족 생성
        </Button>
        <Button variant="secondary" size="md" className="flex-1 self-start" onPress={() => setShowJoinModal(true)}>
          초대 코드 입력
        </Button>
      </View>

      <FlatList
        data={families}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListHeaderComponent={
          <Text className="text-label-md text-text-secondary mb-2">내 가족</Text>
        }
        renderItem={({ item }) => (
          <FamilyCard
            family={item}
            isSelected={item.id === selectedFamily?.id}
            onPress={() => onFamilySelect(item)}
          />
        )}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-body-md text-text-tertiary">가족이 없습니다</Text>
            <Text className="text-label-sm text-text-tertiary mt-1">
              가족을 생성하거나 초대 코드를 입력하세요
            </Text>
          </View>
        }
      />

      {selectedFamily && (
        <View className="px-4 mt-4">
          {isAdmin && (
            <View className="flex-row gap-3 mb-4">
              <Button variant="outline" size="sm" className="flex-1 self-start" onPress={onCopyCode}>
                코드 보기
              </Button>
              <Button variant="outline" size="sm" className="flex-1 self-start" onPress={onShareInvite}>
                초대 공유
              </Button>
            </View>
          )}

          <Text className="text-label-md text-text-secondary mb-2">
            멤버 ({members.length})
          </Text>
          {members.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              isSelf={member.userId === currentMember?.userId}
              onRemove={() => onRemoveMember(member)}
              onRoleChange={(role) => onRoleChange(member, role)}
            />
          ))}

          <Text className="text-label-md text-text-secondary mb-2 mt-4">
            공유 거래 ({familyEntries.length})
          </Text>
          {familyEntries.length === 0 ? (
            <View className="py-4 items-center">
              <Text className="text-body-md text-text-tertiary">공유된 거래가 없습니다</Text>
            </View>
          ) : (
            familyEntries.slice(0, 10).map((entry) => (
              <View
                key={entry.id}
                className="flex-row items-center justify-between py-2.5 px-3 rounded-xl bg-bg-secondary mb-1.5"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-label-sm text-text-secondary">
                      {entry.date}
                    </Text>
                    <View className={`px-1.5 py-0.5 rounded ${
                      entry.type === 'income' ? 'bg-accent-green/20' :
                      entry.type === 'expense' ? 'bg-accent-red/20' :
                      'bg-accent-green/20'
                    }`}>
                      <Text className={`text-label-sm ${
                        entry.type === 'income' ? 'text-accent-green' :
                        entry.type === 'expense' ? 'text-accent-red' :
                        'text-accent-green'
                      }`}>
                        {entry.type === 'income' ? '수입' : entry.type === 'expense' ? '지출' : '저축'}
                      </Text>
                    </View>
                  </View>
                  {entry.note && (
                    <Text className="text-body-md text-text-primary mt-0.5" numberOfLines={1}>
                      {entry.note}
                    </Text>
                  )}
                </View>
                <Text className={`text-body-md font-semibold ml-2 ${
                  entry.type === 'income' ? 'amount-income' : 'amount-expense'
                }`}>
                  {entry.type === 'income' ? '+' : '-'}₩{entry.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}

          <Button variant="danger" className="mt-4" onPress={onLeave}>
            가족 탈퇴
          </Button>
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
      className={`flex-row items-center py-3 px-4 rounded-lg mb-2 ${
        isSelected ? 'bg-accent-green/10 border border-accent-green/30' : 'bg-bg-secondary'
      }`}
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-accent-purple/20 items-center justify-center mr-3">
        <Text className="text-lg">👨‍👩‍👧</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body-md font-medium text-text-primary">{family.name}</Text>
        <Text className="text-label-sm text-text-tertiary">
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
      <View className="w-8 h-8 rounded-full bg-accent-green/20 items-center justify-center mr-3">
        <Text className="text-sm">{isSelf ? '👤' : '👥'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body-md font-medium text-text-primary">
          {member.userName ?? member.userEmail ?? member.userId.slice(0, 8)}
          {isSelf ? ' (나)' : ''}
        </Text>
        <View className="flex-row items-center gap-1">
          <View className={`px-2 py-0.5 rounded-full ${member.role === 'admin' ? 'bg-accent-purple/20' : member.role === 'viewer' ? 'bg-accent-orange/20' : 'bg-accent-green/20'}`}>
            <Text className={`text-label-sm ${member.role === 'admin' ? 'text-accent-purple' : member.role === 'viewer' ? 'text-accent-orange' : 'text-accent-green'}`}>
              {ROLE_LABELS_MAP[member.role]}
            </Text>
          </View>
        </View>
      </View>
      {isAdmin && !isSelf && (
        <View className="flex-row gap-1">
          <TouchableOpacity
            className="w-7 h-7 rounded-full bg-accent-green/10 items-center justify-center"
            onPress={onRemove}
          >
            <X size={16} color={colors.accentRed} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
