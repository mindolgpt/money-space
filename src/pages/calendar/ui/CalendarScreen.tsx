import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useEntries } from '@/entities/entry'

export function CalendarScreen() {
  const { user } = useAuthStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const { data: entries = [] } = useEntries(user?.id ?? '', year, month)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const getEntriesForDay = (day: number) =>
    entries.filter((e) => {
      const d = new Date(e.date)
      return (
        d.getDate() === day &&
        d.getMonth() + 1 === month &&
        d.getFullYear() === year
      )
    })

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity
          onPress={() =>
            setMonth((m) => (m === 1 ? (setYear((y) => y - 1), 12) : m - 1))
          }
        >
          <Text className="text-xl">◀</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">
          {year}년 {month}월
        </Text>
        <TouchableOpacity
          onPress={() =>
            setMonth((m) => (m === 12 ? (setYear((y) => y + 1), 1) : m + 1))
          }
        >
          <Text className="text-xl">▶</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap bg-white mx-4 rounded-xl p-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <View key={d} className="w-[14.28%] items-center py-2">
            <Text className="text-xs text-gray-400">{d}</Text>
          </View>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`empty-${i}`} className="w-[14.28%] p-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayEntries = getEntriesForDay(day)
          const totalExpense = dayEntries
            .filter((e) => e.type === 'expense')
            .reduce((s, e) => s + e.amount, 0)

          return (
            <TouchableOpacity key={day} className="w-[14.28%] p-1 items-center">
              <Text className="text-sm">{day}</Text>
              {totalExpense > 0 && (
                <Text className="text-xs text-red-400">
                  {totalExpense.toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}
