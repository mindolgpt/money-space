import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { Button } from '@/shared/ui'
import { colors } from '@/shared/lib/colors'
import { Calendar } from 'lucide-react-native'

type Props = {
  value: string
  onChange: (date: string) => void
}

export function DatePicker({ value, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(
    value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear(),
  )
  const [selectedMonth, setSelectedMonth] = useState(
    value ? parseInt(value.split('-')[1], 10) : new Date().getMonth() + 1,
  )
  const [selectedDay, setSelectedDay] = useState(
    value ? parseInt(value.split('-')[2], 10) : new Date().getDate(),
  )

  const formatDisplay = (date: string) => {
    if (!date) return '날짜 선택'
    const [y, m, d] = date.split('-')
    return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
  }

  const openPicker = () => {
    const [y, m, d] = value ? value.split('-') : [null, null, null]
    setSelectedYear(y ? parseInt(y, 10) : new Date().getFullYear())
    setSelectedMonth(m ? parseInt(m, 10) : new Date().getMonth() + 1)
    setSelectedDay(d ? parseInt(d, 10) : new Date().getDate())
    setShowModal(true)
  }

  const confirm = () => {
    const monthStr = String(selectedMonth).padStart(2, '0')
    const dayStr = String(selectedDay).padStart(2, '0')
    onChange(`${selectedYear}-${monthStr}-${dayStr}`)
    setShowModal(false)
  }

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <>
      <View className="mb-4">
        <Text className="text-label-md text-text-secondary mb-2 font-medium">날짜</Text>
        <Button
          variant="outline"
          size="md"
          fullWidth
          icon={<Calendar size={20} color={colors.textTertiary} />}
          onPress={openPicker}
        >
          {formatDisplay(value)}
        </Button>
      </View>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-primary">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Button variant="ghost" onPress={() => setShowModal(false)}>취소</Button>
            <Text className="text-headline-md font-bold text-text-primary">날짜 선택</Text>
            <Button variant="ghost" onPress={confirm}>확인</Button>
          </View>

          <View className="flex-row flex-1">
            <ScrollView className="flex-1">
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  className={`py-3 items-center ${selectedYear === y ? 'bg-accent-green/10' : ''}`}
                  onPress={() => setSelectedYear(y)}
                >
                  <Text className={`text-label-md ${selectedYear === y ? 'text-accent-green font-semibold' : 'text-text-secondary'}`}>
                    {y}년
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView className="flex-1">
              {months.map((m) => (
                <TouchableOpacity
                  key={m}
                  className={`py-3 items-center ${selectedMonth === m ? 'bg-accent-green/10' : ''}`}
                  onPress={() => setSelectedMonth(m)}
                >
                  <Text className={`text-label-md ${selectedMonth === m ? 'text-accent-green font-semibold' : 'text-text-secondary'}`}>
                    {m}월
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView className="flex-1">
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  className={`py-3 items-center ${selectedDay === d ? 'bg-accent-green/10' : ''}`}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text className={`text-label-md ${selectedDay === d ? 'text-accent-green font-semibold' : 'text-text-secondary'}`}>
                    {d}일
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}
