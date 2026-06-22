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
import { Search, AlertTriangle, Wallet, Plus, TrendingUp } from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'
import { MonthlySummary } from '@/widgets/monthly-summary'
import { RecentEntries } from '@/widgets/recent-entries'
import { QuickInput } from '@/widgets/quick-input'
import { SyncStatus } from '@/widgets/sync-status'
import { EntryForm, useEntryFormStore } from '@/features/entry/add-entry'
import { SearchSheet } from '@/features/entry/search-entries'
import { Card, AmountText } from '@/shared/ui'

export function HomeScreen() {
  const { user } = useAuthStore()
  const { isOpen, open, close } = useEntryFormStore()
  const [isSearchOpen, setSearchOpen] = useState(false)
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
    <View className="flex-1 bg-bg-primary">
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
        {/* Header */}
        <View className="px-5 pt-6 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              {isLoading ? (
                <View>
                  <View className="h-3 w-16 bg-bg-tertiary rounded-full mb-1" />
                  <View className="h-6 w-32 bg-bg-tertiary rounded-full" />
                </View>
              ) : (
                <>
                  <Text className="text-[13px] text-text-secondary font-medium tracking-tight">안녕하세요</Text>
                  <Text className="text-xl font-bold text-text-primary tracking-tight">
                    {user?.name ? `${user.name}님` : 'Money Space'}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center bg-bg-tertiary"
              onPress={() => setSearchOpen(true)}
            >
              <Search size={18} color="#86868B" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-2">
          <SyncStatus />
        </View>

        {isError ? (
          <Card className="mx-4 items-center py-8">
            <AlertTriangle size={32} color="#FF3B30" className="mb-3" />
            <Text className="text-sm text-text-secondary mb-4">
              데이터를 불러오지 못했습니다
            </Text>
            <TouchableOpacity
              className="bg-accent-blue py-2.5 px-6 rounded-xl"
              onPress={() => refetch()}
            >
              <Text className="text-white text-sm font-semibold">다시 시도</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Balance Card */}
            <View className="px-4 mb-4">
              <Card variant="elevated" padded={false} className="overflow-hidden">
                <View className="p-6">
                  <Text className="text-xs font-semibold text-text-secondary tracking-widest uppercase">총 자산</Text>
                  <Text className="text-[32px] font-bold text-text-primary mt-1 tracking-tight">
                    ₩{balance.toLocaleString()}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="px-2 py-0.5 rounded-full bg-semantic-income/15">
                      <TrendingUp size={12} color="#34C759" />
                    </View>
                    <Text className="text-xs text-text-secondary ml-2">이번달 현황</Text>
                  </View>
                </View>
                <View className="flex-row border-t border-border">
                  <View className="flex-1 items-center py-4">
                    <Text className="text-xs text-text-secondary mb-1 font-medium">수입</Text>
                    <AmountText amount={income} type="income" className="text-[15px]" />
                  </View>
                  <View className="w-px bg-border" />
                  <View className="flex-1 items-center py-4">
                    <Text className="text-xs text-text-secondary mb-1 font-medium">지출</Text>
                    <AmountText amount={expense} type="expense" className="text-[15px]" />
                  </View>
                </View>
              </Card>
            </View>

            {/* Monthly Stats */}
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
              <View className="items-center py-16 px-8">
                <View className="w-16 h-16 rounded-2xl bg-bg-tertiary items-center justify-center mb-5">
                  <Wallet size={28} color="#86868B" />
                </View>
                <Text className="text-lg font-bold text-text-primary mb-1 tracking-tight">
                  첫 기록을 남겨보세요
                </Text>
                <Text className="text-sm text-text-secondary text-center mb-6 leading-5">
                  FAB 버튼이나 빠른 입력으로{'\n'}오늘의 가계부를 시작하세요
                </Text>
                <TouchableOpacity
                  className="bg-accent-blue py-3.5 px-8 rounded-xl"
                  onPress={open}
                >
                  <Text className="text-white font-semibold text-base">새 거래 추가</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <Modal visible={isSearchOpen} animationType="slide">
        <View className="flex-1 bg-bg-primary">
          <SearchSheet onClose={() => setSearchOpen(false)} />
        </View>
      </Modal>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-secondary">
          <EntryForm onClose={close} />
        </View>
      </Modal>

      {/* FAB */}
      <Animated.View style={fabAnim} className="absolute bottom-24 right-5">
        <TouchableOpacity
          className="w-14 h-14 bg-accent-blue rounded-2xl items-center justify-center"
          style={{
            shadowColor: '#007AFF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={open}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
