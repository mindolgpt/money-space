import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useFamily, useFamilyMembers } from '@/entities/family'
import { InviteScreen } from '@/features/family/family-invite'
import { InviteFamilyModal } from '@/features/family/family-modal'
import { useEntries } from '@/entities/entry'
import {
  Users,
  UserPlus,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Utensils,
  ShoppingCart,
  Car,
  Coffee,
  Film,
  Pill,
  Wallet,
  FileText,
  Bell,
  Search,
} from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
import { TopAppBar, Card, IconCircle, Button } from '@/shared/ui'

export function SharedScreen() {
  const { user } = useAuthStore()
  const { data: family } = useFamily(user?.id)
  const { data: members = [] } = useFamilyMembers(family?.id)
  const { data: allEntries = [] } = useEntries(user?.id ?? '', new Date().getFullYear(), new Date().getMonth() + 1)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  if (!user) return null

  if (!family) {
    return (
      <View className="flex-1 bg-bg-primary">
        <InviteScreen familyId={''} />
      </View>
    )
  }

  const sharedEntries = allEntries.filter((e) => e.isShared).slice(0, 10)

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getCategoryIcon = (categoryId?: string) => {
    const icons: Record<string, typeof Utensils> = {
      food: Utensils, shopping: ShoppingCart, transport: Car,
      cafe: Coffee, entertainment: Film, health: Pill,
      salary: Wallet, etc: FileText,
    }
    return icons[categoryId || 'etc'] || FileText
  }

  return (
    <View className="flex-1 bg-bg-primary">
      <TopAppBar
        title={family.name}
        trailing={
          <>
            <TouchableOpacity>
              <Search size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Bell size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            <View className="w-8 h-8 rounded-full bg-accent-green items-center justify-center">
              <Text className="text-label-sm font-semibold text-white">
                {members.length}
              </Text>
            </View>
          </>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stories Section */}
        <View className="py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            <TouchableOpacity
              className="items-center"
              onPress={() => setShowInviteModal(true)}
            >
              <View className="w-16 h-16 rounded-full border-2 border-dashed border-border items-center justify-center">
                <UserPlus size={24} color={colors.textTertiary} />
              </View>
              <Text className="text-label-sm font-semibold text-text-tertiary mt-1.5">초대</Text>
            </TouchableOpacity>

            {members.map((member) => (
              <TouchableOpacity key={member.id} className="items-center">
                <View className="w-16 h-16 rounded-full items-center justify-center bg-accent-green" style={{ padding: 2 }}>
                  <View className="w-full h-full rounded-full overflow-hidden border-2 border-white items-center justify-center bg-bg-tertiary">
                    <Text className="text-label-md font-bold text-text-primary">
                      {member.userName?.charAt(0) ?? '?'}
                    </Text>
                  </View>
                </View>
                <Text className="text-label-sm font-semibold text-text-secondary mt-1.5">
                  {member.userName?.split(' ')[0] ?? '멤버'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {sharedEntries.length === 0 && (
          <>
            <View className="items-center py-16 px-8">
              <IconCircle icon={Users} variant="gray" size="xl" className="mb-4" />
              <Text className="text-headline-md font-bold text-text-primary mb-1">아직 공유된 거래가 없습니다</Text>
              <Text className="text-body-md text-text-secondary text-center mb-6">
                거래를 추가할 때 공유 옵션을 켜면{'\n'}피드에 표시됩니다
              </Text>
              <Button variant="primary" size="sm" onPress={() => setShowInviteModal(true)}>
                초대 코드 만들기
              </Button>
            </View>

            <View className="px-4 mt-2">
              <View className="rounded-xl p-6 bg-accent-green/5">
                <IconCircle icon={Wallet} variant="green" size="lg" className="mb-3" />
                <Text className="text-headline-lg font-bold text-accent-green mb-1">첫 공유까지 한 걸음!</Text>
                <Text className="text-body-md text-text-secondary mb-4">
                  가족과 함께 자산을 관리하고{'\n'}목표를 달성해보세요
                </Text>
                <Button variant="primary" size="md" fullWidth>
                  시작하기
                </Button>
              </View>
            </View>
          </>
        )}

        {sharedEntries.map((entry) => {
          const IconComponent = getCategoryIcon(entry.categoryId)
          const member = members.find((m) => m.userId === entry.userId)
          const isLiked = likedPosts.has(entry.id)

          return (
            <Card key={entry.id} padded={false} className="mx-4 mb-4 overflow-hidden">
              <View className="flex-row items-center p-4">
                <View className="w-10 h-10 rounded-full bg-accent-green/10 items-center justify-center border border-border">
                  <Text className="text-label-md font-semibold text-accent-green">
                    {member?.userName?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-label-md font-semibold text-text-primary">
                    {member?.userName ?? '사용자'}
                  </Text>
                  <Text className="text-label-sm text-text-tertiary mt-0.5">
                    {entry.date}
                  </Text>
                </View>
              </View>

              <View className="px-4 pb-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-9 h-9 rounded-full bg-bg-tertiary items-center justify-center">
                    <IconComponent size={16} color={colors.textTertiary} />
                  </View>
                  <View>
                    <Text className="text-label-md font-medium text-text-primary">
                      {entry.note || '내역'}
                    </Text>
                    <Text className="text-label-sm text-text-tertiary">{entry.categoryId}</Text>
                  </View>
                </View>
                <Text className="text-headline-md font-bold text-semantic-expense">
                  {entry.type === 'income' ? '+' : '-'}
                  ₩{entry.amount.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row items-center justify-between px-4 py-3 border-t border-border">
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => toggleLike(entry.id)}
                  >
                    <Heart
                      size={18}
                      color={isLiked ? colors.accentGreen : colors.textTertiary}
                      fill={isLiked ? colors.accentGreen : 'transparent'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <MessageCircle size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <Share2 size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Bookmark size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </Card>
          )
        })}

        {sharedEntries.length > 0 && (
          <View className="items-center pt-4 pb-8">
            <Button
              variant="primary"
              size="sm"
              onPress={() => setShowInviteModal(true)}
              icon={<UserPlus size={18} color={colors.white} />}
            >
              멤버 초대하기
            </Button>
          </View>
        )}
      </ScrollView>

      {showInviteModal && family && (
        <InviteFamilyModal
          familyId={family.id}
          familyName={family.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </View>
  )
}
