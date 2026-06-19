import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useFamily, useFamilyMembers } from '@/entities/family'
import { InviteScreen } from '@/features/family/family-invite'
import { InviteFamilyModal } from '@/features/family/family-modal'
import { router } from 'expo-router'

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
      <View className="flex-1 bg-primary">
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
      className="flex-1 bg-primary"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-5 pt-4 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-semibold text-primary">
            {family.name}
          </Text>
          <Text className="text-xs text-tertiary">
            멤버 {members.length}명
          </Text>
        </View>
        <TouchableOpacity
          className="px-4 py-2 rounded-full bg-accent-blue/10"
          onPress={() => router.push({ pathname: '/family/manage' } as any)}
        >
          <Text className="text-accent-blue text-sm font-medium">관리</Text>
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
              className={`text-sm font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Family Members */}
      <View className="px-4 mb-4">
        <Text className="text-sm text-secondary mb-2">멤버</Text>
        <View className="card-glass divide-y divide-subtle">
          {members.map((member) => (
            <View key={member.id} className="flex-row items-center p-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor:
                    member.role === 'admin' ? '#667EEA' : '#A78BFA',
                }}
              >
                <Text className="text-white font-medium">
                  {member.userName?.charAt(0) ??
                    member.userEmail?.charAt(0) ??
                    '?'}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-medium text-primary">
                  {member.userName ??
                    member.userEmail ??
                    member.userId.slice(0, 8)}
                  {member.userId === user.id ? ' (나)' : ''}
                </Text>
                <Text className="text-xs text-tertiary">
                  {member.role === 'admin'
                    ? '관리자'
                    : member.role === 'viewer'
                      ? '뷰어'
                      : '멤버'}
                </Text>
              </View>
              <View className="badge badge-green">
                <Text className="text-xs">활성</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Shared Entries placeholder */}
      <View className="px-4">
        <Text className="text-sm font-medium text-primary mb-3">
          공유된 거래
        </Text>
        <View className="items-center py-12">
          <Text className="text-tertiary text-sm">
            아직 공유된 거래가 없습니다
          </Text>
        </View>
      </View>

      {/* Invite Button */}
      <View className="items-center px-4 pt-4">
        <TouchableOpacity
          className="px-8 py-3 bg-accent-blue rounded-full"
          onPress={() => setShowInviteModal(true)}
        >
          <Text className="text-white font-medium text-sm">초대 코드 만들기</Text>
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