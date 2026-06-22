import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useFamily, useFamilyMembers } from '@/entities/family'
import { InviteScreen } from '@/features/family/family-invite'
import { InviteFamilyModal } from '@/features/family/family-modal'
import { router } from 'expo-router'
import { Users, UserPlus } from 'lucide-react-native'
import { Card, Badge } from '@/shared/ui'

type FilterTab = 'all' | 'personal' | 'shared'

export function SharedScreen() {
  const { user } = useAuthStore()
  const { data: family } = useFamily(user?.id)
  const { data: members = [] } = useFamilyMembers(family?.id)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)

  if (!user) return null

  if (!family) {
    return (
      <View className="flex-1 bg-bg-primary">
        <InviteScreen familyId={''} />
      </View>
    )
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'personal', label: '개인' },
    { key: 'shared', label: '공유' },
  ]

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-5 pt-4 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-text-primary tracking-tight">
            {family.name}
          </Text>
          <Text className="text-xs text-text-tertiary mt-0.5">
            멤버 {members.length}명
          </Text>
        </View>
        <TouchableOpacity
          className="px-4 py-2 rounded-full bg-accent-blue/10"
          onPress={() => router.push({ pathname: '/family/manage' } as any)}
        >
          <Text className="text-accent-blue text-sm font-semibold">관리</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row gap-2 px-4 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`px-4 py-2 rounded-full ${
              activeTab === tab.key ? 'bg-accent-blue' : 'bg-bg-tertiary'
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Family Members */}
      <View className="px-4 mb-4">
        <Text className="text-sm text-text-secondary mb-2 font-semibold tracking-tight">멤버</Text>
        <Card variant="elevated" padded={false}>
          {members.map((member) => (
            <View key={member.id} className="flex-row items-center p-4 border-b border-border last:border-b-0">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: member.role === 'admin' ? '#007AFF' : '#AF52DE',
                }}
              >
                <Text className="text-white font-semibold text-sm">
                  {member.userName?.charAt(0) ?? member.userEmail?.charAt(0) ?? '?'}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text-primary text-sm">
                  {member.userName ?? member.userEmail ?? member.userId.slice(0, 8)}
                  {member.userId === user.id ? ' (나)' : ''}
                </Text>
                <Text className="text-xs text-text-tertiary mt-0.5">
                  {member.role === 'admin' ? '관리자' : member.role === 'viewer' ? '뷰어' : '멤버'}
                </Text>
              </View>
              <Badge variant="green" label="활성" />
            </View>
          ))}
        </Card>
      </View>

      {/* Shared Entries */}
      <View className="px-4">
        <Text className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
          공유된 거래
        </Text>
        <View className="items-center py-12">
          <View className="w-14 h-14 rounded-2xl bg-bg-tertiary items-center justify-center mb-4">
            <Users size={24} color="#86868B" />
          </View>
          <Text className="text-text-tertiary text-sm">아직 공유된 거래가 없습니다</Text>
        </View>
      </View>

      {/* Invite Button */}
      <View className="items-center px-4 pt-4">
        <TouchableOpacity
          className="flex-row items-center px-8 py-3 bg-accent-blue rounded-xl"
          onPress={() => setShowInviteModal(true)}
        >
          <UserPlus size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-sm ml-2">초대 코드 만들기</Text>
        </TouchableOpacity>
      </View>

      {showInviteModal && family && (
        <InviteFamilyModal
          familyId={family.id}
          familyName={family.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </ScrollView>
  )
}
