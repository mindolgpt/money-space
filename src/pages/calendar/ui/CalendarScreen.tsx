import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'
import { useCategories } from '@/entities/category'
import type { Entry } from '@/entities/entry'

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']
type ViewMode = 'month' | 'week'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', shopping: '🛒', transport: '🚗', cafe: '☕',
  entertainment: '🎬', health: '💊', salary: '💰', etc: '📝',
}

export function CalendarScreen() {
  const { user } = useAuthStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const { data: entries = [] } = useEntries(user?.id ?? '', year, month)
  const { data: categories = [] } = useCategories()

  const getCategoryName = (id?: string) => {
    if (!id) return '기타'
    const cat = categories.find((c) => c.id === id)
    return cat?.name ?? '기타'
  }

  const getCategoryIcon = (id?: string) => {
    if (!id) return CATEGORY_ICONS.etc
    const cat = categories.find((c) => c.id === id)
    return CATEGORY_ICONS[cat?.icon ?? 'etc'] ?? '📝'
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const getEntriesForDay = (day: number) =>
    entries.filter((e) => {
      const d = new Date(e.date)
      return d.getDate() === day && d.getMonth() + 1 === month && d.getFullYear() === year
    })

  const getDayExpense = (day: number) =>
    getEntriesForDay(day).filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

  const getDayIncome = (day: number) =>
    getEntriesForDay(day).filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)

  const monthIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const monthExpense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const monthSaving = entries.filter((e) => e.type === 'saving').reduce((s, e) => s + e.amount, 0)

  const changeMonth = (delta: number) => {
    setMonth((m) => {
      let newM = m + delta
      let newY = year
      if (newM < 1) { newM = 12; newY -= 1 }
      else if (newM > 12) { newM = 1; newY += 1 }
      setYear(newY)
      return newM
    })
    setSelectedDay(null)
  }

  const goToToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDay(null)
  }

  const selectedDayExpense = selectedDay ? getDayExpense(selectedDay) : 0
  const selectedDayIncome = selectedDay ? getDayIncome(selectedDay) : 0
  const selectedDayEntries = selectedDay ? getEntriesForDay(selectedDay) : []

  const goToDetail = (entry: Entry) => {
    router.push(`/details?id=${entry.id}` as any)
  }

  const formatAmount = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
    return n.toLocaleString()
  }

  return (
    <ScrollView
      className="flex-1 bg-primary"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-4 mb-3">
        <Text className="text-xl font-semibold text-primary">달력</Text>
      </View>

      {/* Month Summary */}
      <View className="card-glass mx-4 p-4 mb-3">
        <View className="flex-row">
          <View className="flex-1 items-center">
            <Text className="text-xs text-secondary">수입</Text>
            <Text className="font-semibold amount-income mt-1">{formatAmount(monthIncome)}</Text>
          </View>
          <View className="flex-1 items-center border-l border-subtle">
            <Text className="text-xs text-secondary">지출</Text>
            <Text className="font-semibold amount-expense mt-1">{formatAmount(monthExpense)}</Text>
          </View>
          <View className="flex-1 items-center border-l border-subtle">
            <Text className="text-xs text-secondary">저축</Text>
            <Text className="font-semibold text-accent-blue mt-1">{formatAmount(monthSaving)}</Text>
          </View>
        </View>
      </View>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mx-4 mb-3">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="px-3 h-9 rounded-full items-center justify-center bg-accent-blue" onPress={goToToday}>
            <Text className="text-sm text-white font-medium">오늘</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-lg font-semibold text-primary">{year}년 {month}월</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-bg-tertiary" onPress={() => changeMonth(-1)}>
            <Text className="text-base">◀</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-bg-tertiary" onPress={() => changeMonth(1)}>
            <Text className="text-base">▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View className="flex-row justify-center mb-3">
        <View className="flex-row bg-bg-tertiary rounded-full p-1">
          <TouchableOpacity
            className={`px-4 py-1.5 rounded-full ${viewMode === 'month' ? 'bg-accent-blue' : ''}`}
            onPress={() => setViewMode('month')}
          >
            <Text className={`text-sm font-medium ${viewMode === 'month' ? 'text-white' : 'text-secondary'}`}>월간</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-1.5 rounded-full ${viewMode === 'week' ? 'bg-accent-blue' : ''}`}
            onPress={() => setViewMode('week')}
          >
            <Text className={`text-sm font-medium ${viewMode === 'week' ? 'text-white' : 'text-secondary'}`}>주간</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <View className="card-glass mx-4 p-4 mb-4">
        <View className="flex-row mb-2">
          {WEEK_DAYS.map((day, index) => (
            <View key={day} className="flex-1 items-center py-2">
              <Text className={`text-xs font-medium ${index === 0 ? 'text-accent-red' : index === 6 ? 'text-accent-blue' : 'text-secondary'}`}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {viewMode === 'month' ? (
          <View className="flex-row flex-wrap">
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const hasExpense = getDayExpense(day) > 0
              const hasIncome = getDayIncome(day) > 0
              const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()
              const isSelected = day === selectedDay

              return (
                <Pressable
                  key={day}
                  className="w-[14.28%] aspect-square items-center justify-center"
                  onPress={() => setSelectedDay(isSelected ? null : day)}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${isToday ? 'bg-accent-blue' : isSelected ? 'bg-bg-tertiary' : ''}`}>
                    <Text className={`text-base font-medium ${isToday ? 'text-white' : hasExpense || hasIncome ? 'text-primary' : 'text-secondary'}`}>
                      {day}
                    </Text>
                  </View>
                  {(hasExpense || hasIncome) && !isToday && (
                    <View className="absolute bottom-1 flex-row gap-0.5">
                      {hasExpense && <View className="w-1 h-1 rounded-full bg-accent-red" />}
                      {hasIncome && <View className="w-1 h-1 rounded-full bg-accent-green" />}
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View className="flex-row">
            {(() => {
              const targetDate = selectedDay ? new Date(year, month - 1, selectedDay) : now
              const currentWeekStart = new Date(targetDate)
              currentWeekStart.setDate(targetDate.getDate() - targetDate.getDay())

              return Array.from({ length: 7 }).map((_, i) => {
                const weekDate = new Date(currentWeekStart)
                weekDate.setDate(currentWeekStart.getDate() + i)
                const isCurrentMonth = weekDate.getMonth() + 1 === month
                const isToday = weekDate.getDate() === now.getDate() &&
                  weekDate.getMonth() === now.getMonth() &&
                  weekDate.getFullYear() === now.getFullYear()
                const weekDayExpense = getDayExpense(weekDate.getDate())
                const weekDayIncome = getDayIncome(weekDate.getDate())
                const isSelected = isCurrentMonth && weekDate.getDate() === selectedDay

                return (
                  <Pressable
                    key={i}
                    className="flex-1 items-center py-2"
                    onPress={() => {
                      setSelectedDay(weekDate.getDate())
                      if (weekDate.getMonth() + 1 !== month) {
                        setMonth(weekDate.getMonth() + 1)
                        setYear(weekDate.getFullYear())
                      }
                    }}
                  >
                    <View className={`w-12 h-12 rounded-full items-center justify-center ${isToday ? 'bg-accent-blue' : isSelected ? 'bg-bg-tertiary' : ''}`}>
                      <Text className={`text-sm font-medium ${isToday ? 'text-white' : isCurrentMonth ? 'text-primary' : 'text-tertiary'}`}>
                        {weekDate.getDate()}
                      </Text>
                    </View>
                    <View className="flex-row gap-0.5 mt-1">
                      {weekDayExpense > 0 && <View className="w-1.5 h-1.5 rounded-full bg-accent-red" />}
                      {weekDayIncome > 0 && <View className="w-1.5 h-1.5 rounded-full bg-accent-green" />}
                    </View>
                  </Pressable>
                )
              })
            })()}
          </View>
        )}
      </View>

      {/* Selected Day Detail */}
      {selectedDay && (
        <View className="card-glass mx-4 p-5 mb-4">
          <Text className="text-base font-semibold text-primary mb-4">{month}월 {selectedDay}일</Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 items-center py-3 rounded-xl bg-bg-tertiary">
              <Text className="text-xs text-secondary mb-1">지출</Text>
              <Text className="font-semibold amount-expense">{selectedDayExpense > 0 ? `₩ ${selectedDayExpense.toLocaleString()}` : '-'}</Text>
            </View>
            <View className="flex-1 items-center py-3 rounded-xl bg-bg-tertiary">
              <Text className="text-xs text-secondary mb-1">수입</Text>
              <Text className="font-semibold amount-income">{selectedDayIncome > 0 ? `₩ ${selectedDayIncome.toLocaleString()}` : '-'}</Text>
            </View>
          </View>

          {selectedDayEntries.length > 0 ? (
            <View className="border-t border-subtle pt-3">
              <Text className="text-xs text-secondary mb-2">내역 ({selectedDayEntries.length})</Text>
              {selectedDayEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  className="flex-row justify-between items-center py-2.5"
                  onPress={() => goToDetail(entry)}
                >
                  <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-base">{getCategoryIcon(entry.categoryId)}</Text>
                    <View className="flex-1">
                      <Text className="text-sm text-primary" numberOfLines={1}>{getCategoryName(entry.categoryId)}</Text>
                      {entry.note ? (
                        <Text className="text-xs text-secondary" numberOfLines={1}>{entry.note}</Text>
                      ) : null}
                    </View>
                  </View>
                  <Text className={`text-sm font-medium ml-2 ${entry.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                    {entry.type === 'income' ? '+' : '-'}₩{entry.amount.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="py-6 items-center">
              <Text className="text-tertiary text-sm">내역이 없습니다</Text>
            </View>
          )}
        </View>
      )}

      <Text className="text-center text-xs text-tertiary mb-4">
        ● 빨강: 지출  ● 초록: 수입
      </Text>
    </ScrollView>
  )
}