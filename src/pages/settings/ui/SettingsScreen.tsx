import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserSettings, useUpdateSettings } from '@/entities/user'
import { ProfileSettings } from '@/features/user/profile-settings'
import { NotificationSettings } from '@/features/user/notification-settings'
import { DataExport } from '@/features/user/data-export'
import { DataImport } from '@/features/user/data-import'
import { DeleteAccount } from '@/features/user/delete-account'
import { BudgetManager } from '@/features/budget/budget-manager'
import { SyncStatus } from '@/widgets/sync-status'
import { useThemeStore } from '@/shared/lib/theme-provider'
import { Card, Toggle } from '@/shared/ui'
import Constants from 'expo-constants'

type Section = 'profile' | 'theme' | 'notifications' | 'security' | 'budget' | 'export' | 'import' | 'account'

export function SettingsScreen() {
  const { signOut, user, isSigningOut, biometricAvailable, biometricEnabled, enableBiometric, disableBiometric } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [expandedSection, setExpandedSection] = useState<Section | null>(null)
  const [budgetModalVisible, setBudgetModalVisible] = useState(false)
  const { data: settings } = useUserSettings(user?.id)
  const updateSettings = useUpdateSettings()

  const toggleWifiOnly = () => {
    if (!user?.id || !settings) return
    updateSettings.mutate({
      userId: user.id,
      updates: { sync: { ...settings.sync, wifiOnly: !settings.sync.wifiOnly } },
    })
  }

  const toggleBiometric = () => {
    if (!user?.id) return
    if (biometricEnabled) disableBiometric(user.id)
    else enableBiometric(user.id)
  }

  const toggleSection = (section: Section) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ])
  }

  const appVersion = Constants.expoConfig?.version ?? '1.0.0'

  const SectionToggle = ({ section, label }: { section: Section; label: string }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-5 py-4 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)]"
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <Text className="text-base font-medium text-gray-900">{label}</Text>
      <Text className="text-gray-300 text-base">
        {expandedSection === section ? '▼' : '▶'}
      </Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView className="flex-1 bg-[#F5F5F7]" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-xl font-bold text-gray-900">설정</Text>
      </View>

      <View className="px-4 space-y-2">
        <SectionToggle section="profile" label="프로필" />
        {expandedSection === 'profile' && <View className="px-1 mb-2"><ProfileSettings /></View>}

        <SectionToggle section="theme" label="화면 테마" />
        {expandedSection === 'theme' && (
          <View className="px-1 mb-2">
            <Card>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-gray-900">다크 모드</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{isDark ? '다크 테마' : '라이트 테마'}</Text>
                </View>
                <Toggle value={isDark} onToggle={toggleTheme} />
              </View>
            </Card>
          </View>
        )}

        <SectionToggle section="notifications" label="알림" />
        {expandedSection === 'notifications' && <View className="px-1 mb-2"><NotificationSettings /></View>}

        <SectionToggle section="security" label="보안" />
        {expandedSection === 'security' && (
          <View className="px-1 mb-2">
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">생체 인증</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {biometricAvailable
                      ? (biometricEnabled ? '생체 인증으로 잠금 해제' : '앱 실행 시 생체 인증 필요')
                      : '이 기기에서 생체 인증을 지원하지 않습니다'}
                  </Text>
                </View>
                {biometricAvailable && <Toggle value={biometricEnabled} onToggle={toggleBiometric} />}
              </View>
            </Card>
          </View>
        )}

        <SectionToggle section="budget" label="예산 관리" />
        {expandedSection === 'budget' && (
          <View className="px-1 mb-2">
            <Card>
              <TouchableOpacity className="py-3 rounded-xl items-center bg-blue-500" onPress={() => setBudgetModalVisible(true)}>
                <Text className="text-white font-medium">예산 설정하기</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        <SectionToggle section="export" label="데이터 내보내기" />
        {expandedSection === 'export' && <View className="px-1 mb-2"><DataExport /></View>}

        <SectionToggle section="import" label="데이터 가져오기" />
        {expandedSection === 'import' && <View className="px-1 mb-2"><DataImport /></View>}

        <SectionToggle section="account" label="계정 관리" />
        {expandedSection === 'account' && (
          <View className="px-1 mb-2 space-y-2">
            <Card>
              <TouchableOpacity className="py-3 rounded-xl items-center bg-red-50" onPress={handleSignOut} disabled={isSigningOut}>
                <Text className="text-red-500 font-medium">{isSigningOut ? '로그아웃 중...' : '로그아웃'}</Text>
              </TouchableOpacity>
            </Card>
            <DeleteAccount />
          </View>
        )}
      </View>

      <View className="px-4 mt-6 mb-8">
        <Card className="items-center py-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-medium text-gray-900">동기화 상태</Text>
          </View>
          <SyncStatus />
          <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-[rgba(0,0,0,0.04)]">
            <View>
              <Text className="text-sm font-medium text-gray-900">Wi-Fi만 동기화</Text>
              <Text className="text-xs text-gray-400 mt-0.5">모바일 데이터 사용 시 동기화 안 함</Text>
            </View>
            <Toggle value={settings?.sync?.wifiOnly ?? false} onToggle={toggleWifiOnly} />
          </View>
        </Card>
      </View>

      <Text className="text-xs text-gray-300 text-center">Money Space v{appVersion}</Text>

      <BudgetManager visible={budgetModalVisible} onClose={() => setBudgetModalVisible(false)} />
    </ScrollView>
  )
}
