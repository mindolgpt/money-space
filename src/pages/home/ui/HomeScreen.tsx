import { useState, useCallback, useMemo, type LucideIcon } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  RefreshControl,
} from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import {
  Search,
  AlertTriangle,
  Wallet,
  Plus,
  TrendingUp,
  Utensils,
  ShoppingCart,
  Car,
  Coffee,
  Film,
  Pill,
  FileText,
  Bell,
} from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries, type Entry } from '@/entities/entry'
import { MonthlySummary } from '@/widgets/monthly-summary'

import { QuickInput } from '@/widgets/quick-input'
import { SyncStatus } from '@/widgets/sync-status'
import { EntryForm, useEntryFormStore } from '@/features/entry/add-entry'
import { SearchSheet } from '@/features/entry/search-entries'
import { colors } from '@/shared/lib/colors'
import { Card } from '@/shared/ui'
import { router } from 'expo-router'

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

  const { income, expense, saving, balance } = useMemo(() => {
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const saving = entries.filter((e) => e.type === 'saving').reduce((s, e) => s + e.amount, 0)
    return { income, expense, saving, balance: income - expense - saving }
  }, [entries])

  const fabAnim = useAnimatedStyle(
    () => ({
      transform: [{ scale: withSpring(1, { stiffness: 200, damping: 8 }) }],
    }),
    [],
  )

  const recentTransactions = useMemo(() => {
    return entries.slice(0, 5)
  }, [entries])

  const getCategoryIcon = (categoryId?: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      food: Utensils,
      shopping: ShoppingCart,
      transport: Car,
      cafe: Coffee,
      entertainment: Film,
      health: Pill,
      etc: FileText,
    }
    return icons[categoryId || 'etc'] || FileText
  }

  const renderTransaction = (entry: Entry) => {
    const IconComponent = getCategoryIcon(entry.categoryId)
    const isIncome = entry.type === 'income'

    return (
      <TouchableOpacity
        key={entry.id}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/details', params: { id: entry.id } } as any)}
      >
        <View
          className={`flex-row items-center py-3.5 px-4 ${isIncome ? 'border-l-4 border-l-accent-green' : ''} border-b border-border bg-bg-secondary`}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isIncome ? 'bg-accent-green/10' : 'bg-bg-tertiary'}`}>
            <IconComponent size={16} color={isIncome ? colors.accentGreen : colors.textTertiary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-text-primary">
              {entry.note || '내역'}
            </Text>
            <Text className="text-xs text-text-tertiary mt-0.5">
              {entry.date} · {entry.paymentMethod || '카드'}
            </Text>
          </View>
          <Text
            className={`text-sm font-bold ${
              entry.type === 'income' ? 'text-semantic-income' : entry.type === 'saving' ? 'text-semantic-saving' : 'text-semantic-expense'
            }`}
          >
            {entry.type === 'income' ? '+' : '-'}
            {entry.amount.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-5 h-16 bg-bg-secondary border-b border-border" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      }}>
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-accent-green items-center justify-center">
            <Wallet size={16} color={colors.white} />
          </View>
          <Text className="text-lg font-bold text-accent-green">Money Space</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => setSearchOpen(true)}>
            <Search size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <View className="w-8 h-8 rounded-full bg-bg-tertiary border border-border items-center justify-center">
            <Text className="text-xs font-semibold text-text-secondary">
              {user?.name?.charAt(0) || 'M'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentGreen}
          />
        }
      >
        <View className="px-4 mb-2 pt-4">
          <SyncStatus />
        </View>

        {isError ? (
          <Card className="mx-4 items-center py-8">
            <AlertTriangle size={32} color={colors.accentRed} className="mb-3" />
            <Text className="text-sm text-text-secondary mb-4">
              데이터를 불러오지 못했습니다
            </Text>
            <TouchableOpacity
              className="bg-accent-green py-2.5 px-6 rounded-lg"
              onPress={() => refetch()}
            >
              <Text className="text-white text-sm font-semibold">다시 시도</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Hero Balance Card */}
            <View className="px-4 mb-5">
              <Card className="items-center py-8">
                <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-2">총 잔액</Text>
                <Text className="text-[36px] font-bold text-text-primary" style={{ letterSpacing: -0.72 }}>
                  ₩{balance.toLocaleString()}
                </Text>
                <View className="flex-row items-center mt-3 gap-1.5">
                  <View className="px-2.5 py-0.5 rounded-full bg-semantic-income/15">
                    <TrendingUp size={14} color={colors.accentGreen} />
                  </View>
                  <Text className="text-xs font-medium text-text-secondary">이번 달 +12.5% 증가</Text>
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

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <View className="px-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-text-primary">최근 거래</Text>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/calendar' } as any)}>
                    <Text className="text-sm font-medium text-accent-green">전체 보기</Text>
                  </TouchableOpacity>
                </View>
                <Card padded={false} className="overflow-hidden">
                  {recentTransactions.map(renderTransaction)}
                </Card>

                {/* Dashed Add Button */}
                <TouchableOpacity
                  className="mt-3 border-2 border-dashed border-border rounded-lg py-4 flex-row items-center justify-center"
                  onPress={open}
                  activeOpacity={0.6}
                >
                  <Plus size={18} color={colors.textTertiary} strokeWidth={2} />
                  <Text className="text-sm font-medium text-text-tertiary ml-2">새 거래 추가</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && entries.length === 0 && (
              <View className="items-center py-16 px-8">
                <View className="w-16 h-16 rounded-full bg-bg-tertiary items-center justify-center mb-5">
                  <Wallet size={28} color={colors.textTertiary} />
                </View>
                <Text className="text-lg font-bold text-text-primary mb-1 tracking-tight">
                  첫 기록을 남겨보세요
                </Text>
                <Text className="text-sm text-text-secondary text-center mb-6 leading-5">
                  FAB 버튼이나 빠른 입력으로{'\n'}오늘의 가계부를 시작하세요
                </Text>
                <TouchableOpacity
                  className="bg-accent-green py-3.5 px-8 rounded-lg"
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
          className="w-14 h-14 bg-accent-green rounded-full items-center justify-center"
          style={{
            shadowColor: colors.accentGreen,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={open}
        >
          <Plus size={24} color={colors.white} strokeWidth={3} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
