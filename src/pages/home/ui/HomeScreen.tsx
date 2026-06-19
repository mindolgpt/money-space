import { useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  RefreshControl,
} from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'
import { MonthlySummary } from '@/widgets/monthly-summary'
import { RecentEntries } from '@/widgets/recent-entries'
import { QuickInput } from '@/widgets/quick-input'
import { SyncStatus } from '@/widgets/sync-status'
import { EntryForm, useEntryFormStore } from '@/features/entry/add-entry'
import { SearchSheet } from '@/features/entry/search-entries'
import { useThemeStore } from '@/shared/lib/theme-provider'
import { Card, AmountText } from '@/shared/ui'

export function HomeScreen() {
  const { user } = useAuthStore()
  const { isOpen, open, close } = useEntryFormStore()
  const [isSearchOpen, setSearchOpen] = useState(false)
  const { isDark } = useThemeStore()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
  } = useEntries(user?.id ?? '', year, month)

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 300)
  }, [refetch])

  const income = entries
    .filter((e) => e.type === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const expense = entries
    .filter((e) => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const saving = entries
    .filter((e) => e.type === 'saving')
    .reduce((s, e) => s + e.amount, 0)
  const balance = income - expense - saving

  const fabAnim = useAnimatedStyle(
    () => ({
      transform: [{ scale: withSpring(1, { stiffness: 200, damping: 8 }) }],
    }),
    [],
  )

  return (
    <View className="flex-1 bg-[#F5F5F7]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <View className="px-5 pt-6 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              {isLoading ? (
                <View>
                  <View className="h-3 w-16 bg-gray-200 rounded-full mb-1" />
                  <View className="h-6 w-32 bg-gray-200 rounded-full" />
                </View>
              ) : (
                <>
                  <Text className="text-sm text-gray-400">안녕하세요</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {user?.name ? `${user.name}님` : 'Money Space'}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
              onPress={() => setSearchOpen(true)}
            >
              <Text className="text-base">🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-2">
          <SyncStatus />
        </View>

        {isError ? (
          <Card className="mx-4 items-center py-8">
            <Text className="text-3xl mb-3">⚠️</Text>
            <Text className="text-sm text-gray-400 mb-4">
              데이터를 불러오지 못했습니다
            </Text>
            <TouchableOpacity
              className="bg-blue-500 py-2.5 px-6 rounded-xl"
              onPress={() => refetch()}
            >
              <Text className="text-white text-sm font-medium">다시 시도</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            <View className="px-4 mb-3">
              <Card variant="elevated" padded={false} className="overflow-hidden">
                <View className="p-5">
                  <Text className="text-xs font-medium text-gray-400 tracking-wider uppercase">총 자산</Text>
                  <Text className="text-3xl font-bold text-gray-900 mt-1">
                    ₩{balance.toLocaleString()}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="px-2 py-0.5 rounded-full bg-emerald-50">
                      <Text className="text-xs font-medium text-emerald-500">↑ 12.5%</Text>
                    </View>
                    <Text className="text-xs text-gray-400 ml-2">지난달 대비</Text>
                  </View>
                </View>
                <View className="flex-row border-t border-[rgba(0,0,0,0.04)]">
                  <View className="flex-1 items-center py-3 border-r border-[rgba(0,0,0,0.04)]">
                    <Text className="text-xs text-gray-400 mb-0.5">수입</Text>
                    <AmountText amount={income} type="income" className="text-sm" />
                  </View>
                  <View className="flex-1 items-center py-3">
                    <Text className="text-xs text-gray-400 mb-0.5">지출</Text>
                    <AmountText amount={expense} type="expense" className="text-sm" />
                  </View>
                </View>
              </Card>
            </View>

            <MonthlySummary
              year={year}
              month={month}
              income={income}
              expense={expense}
              saving={saving}
            />

            <QuickInput onEntryAdded={() => refetch()} />

            <RecentEntries entries={entries} />

            {!isLoading && entries.length === 0 && (
              <View className="items-center py-12 px-8">
                <Text className="text-4xl mb-4">💰</Text>
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  첫 기록을 남겨보세요
                </Text>
                <Text className="text-sm text-gray-400 text-center mb-6">
                  FAB 버튼이나 빠른 입력으로{'\n'}오늘의 가계부를 시작하세요
                </Text>
                <TouchableOpacity
                  className="bg-blue-500 py-3 px-8 rounded-xl"
                  onPress={open}
                >
                  <Text className="text-white font-semibold">새 거래 추가</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={isSearchOpen} animationType="slide">
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-[#F5F5F7]'}`}>
          <SearchSheet onClose={() => setSearchOpen(false)} />
        </View>
      </Modal>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <EntryForm onClose={close} />
        </View>
      </Modal>

      <Animated.View style={fabAnim} className="absolute bottom-24 right-5">
        <TouchableOpacity
          className="w-14 h-14 bg-blue-500 rounded-2xl items-center justify-center"
          style={{
            shadowColor: '#007AFF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={open}
        >
          <Text className="text-white text-2xl font-light">+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
