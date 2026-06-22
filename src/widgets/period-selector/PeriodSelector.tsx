import { View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'

export type PeriodType = 'week' | 'month' | 'year'

type Props = {
  selected: PeriodType
  onChange: (period: PeriodType) => void
}

const PERIODS: { key: PeriodType; label: string }[] = [
  { key: 'week', label: '주' },
  { key: 'month', label: '월' },
  { key: 'year', label: '연도' },
]

export function PeriodSelector({ selected, onChange }: Props) {
  const handlePress = (period: PeriodType) => {
    if (period !== selected) {
      Haptics.selectionAsync()
      onChange(period)
    }
  }

  return (
    <View className="flex-row bg-bg-tertiary rounded-xl p-1">
      {PERIODS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          className={`flex-1 py-2 rounded-lg items-center ${
            selected === key ? 'bg-accent-blue' : 'bg-transparent'
          }`}
          onPress={() => handlePress(key)}
        >
          <Text
            className={`text-sm font-medium ${
              selected === key ? 'text-white' : 'text-text-secondary'
            }`}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export function getPeriodDisplayLabel(period: PeriodType, date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const week = getWeekNumber(date)

  switch (period) {
    case 'week':
      return `${year}년 ${week}주차`
    case 'month':
      return `${year}년 ${month}월`
    case 'year':
      return `${year}년`
  }
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

export function getDateRangeForPeriod(period: PeriodType, date: Date): { start: Date; end: Date } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  switch (period) {
    case 'week': {
      const dayOfWeek = date.getDay()
      const start = new Date(date)
      start.setDate(day - dayOfWeek)
      const end = new Date(date)
      end.setDate(day + (6 - dayOfWeek))
      return { start, end }
    }
    case 'month': {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0)
      return { start, end }
    }
    case 'year': {
      const start = new Date(year, 0, 1)
      const end = new Date(year, 11, 31)
      return { start, end }
    }
  }
}