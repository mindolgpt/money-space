import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native'
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
      <TouchableOpacity className="mb-4" onPress={openPicker}>
        <Text className="text-sm text-text-secondary mb-2 font-medium">날짜</Text>
        <View className="flex-row items-center bg-bg-tertiary rounded-xl px-4 py-3">
          <Calendar size={20} color="#86868B" />
          <Text className="text-base text-text-primary ml-2">{formatDisplay(value)}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-primary">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text className="text-accent-blue text-base font-semibold">취소</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text-primary">날짜 선택</Text>
            <TouchableOpacity onPress={confirm}>
              <Text className="text-accent-blue text-base font-semibold">확인</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-1">
            <ScrollView className="flex-1">
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  className={`py-3 items-center ${selectedYear === y ? 'bg-accent-blue/10' : ''}`}
                  onPress={() => setSelectedYear(y)}
                >
                  <Text className={`text-sm ${selectedYear === y ? 'text-accent-blue font-semibold' : 'text-text-secondary'}`}>
                    {y}년
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView className="flex-1">
              {months.map((m) => (
                <TouchableOpacity
                  key={m}
                  className={`py-3 items-center ${selectedMonth === m ? 'bg-accent-blue/10' : ''}`}
                  onPress={() => setSelectedMonth(m)}
                >
                  <Text className={`text-sm ${selectedMonth === m ? 'text-accent-blue font-semibold' : 'text-text-secondary'}`}>
                    {m}월
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView className="flex-1">
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  className={`py-3 items-center ${selectedDay === d ? 'bg-accent-blue/10' : ''}`}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text className={`text-sm ${selectedDay === d ? 'text-accent-blue font-semibold' : 'text-text-secondary'}`}>
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
