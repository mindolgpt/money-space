import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { EntryType, createEntryLocally } from '@/entities/entry'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useLastUsedCategory } from '@/entities/category'
import { Card } from '@/shared/ui'

type Props = {
  onEntryAdded?: () => void
}

const TYPES: { key: EntryType; label: string }[] = [
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
  { key: 'saving', label: '저축' },
]

export function QuickInput({ onEntryAdded }: Props) {
  const { user } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<EntryType>('expense')

  const { data: lastCategory } = useLastUsedCategory(user?.id, type)

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '')
    if (cleaned.length > 12) return
    setAmount(cleaned)
  }

  const handleQuickAdd = () => {
    if (!user || !amount || parseInt(amount, 10) === 0) return

    const amtNum = parseInt(amount, 10)

    if (!lastCategory) {
      Alert.alert('카테고리 필요', '카테고리를 선택해주세요', [{ text: '확인', style: 'cancel' }])
      return
    }

    Alert.alert(`${amtNum.toLocaleString()}원`, `${lastCategory.icon} ${lastCategory.name}로 기록`, [
      { text: '취소', style: 'cancel' },
      {
        text: '저장',
        onPress: () => {
          createEntryLocally({
            userId: user.id,
            amount: amtNum,
            type,
            categoryId: lastCategory.id,
            date: new Date().toISOString().slice(0, 10),
            isShared: false,
            isRecurring: false,
          })
          setAmount('')
          setIsExpanded(false)
          onEntryAdded?.()
        },
      },
    ])
  }

  const displayAmount = amount
    ? `${type === 'income' ? '+' : '-'}${parseInt(amount, 10).toLocaleString()}`
    : ''

  if (!isExpanded) {
    return (
      <View className="px-4 mb-1">
        <TouchableOpacity
          className="flex-row items-center justify-center py-3.5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50"
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}
        >
          <Text className="text-base mr-2">⚡</Text>
          <Text className="text-sm font-medium text-gray-400">빠른 입력</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="px-4 mb-1">
      <Card>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-base mr-2">⚡</Text>
            <Text className="text-sm font-semibold text-gray-900">빠른 입력</Text>
          </View>
          <TouchableOpacity
            className="w-6 h-6 rounded-full items-center justify-center bg-gray-100"
            onPress={() => {
              setAmount('')
              setIsExpanded(false)
            }}
          >
            <Text className="text-xs text-gray-400">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-4">
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                type === t.key ? 'bg-blue-500' : 'bg-gray-100'
              }`}
              onPress={() => setType(t.key)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-medium ${
                  type === t.key ? 'text-white' : 'text-gray-500'
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {lastCategory && (
          <TouchableOpacity className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
            <Text className="text-base mr-2">{lastCategory.icon}</Text>
            <Text className="text-sm text-gray-500 flex-1">{lastCategory.name}</Text>
            <Text className="text-xs text-gray-300">마지막 사용</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <Text className="text-sm text-gray-400 mr-2">₩</Text>
          <TextInput
            className="flex-1 text-lg font-semibold text-gray-900"
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
            placeholderTextColor="#C7C7CC"
            autoFocus
          />
          {displayAmount ? (
            <Text
              className={`text-sm font-medium ${
                type === 'income' ? 'text-emerald-500' : type === 'saving' ? 'text-blue-500' : 'text-red-500'
              }`}
            >
              {displayAmount}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          className={`py-3 rounded-xl items-center ${
            amount && parseInt(amount, 10) > 0 && lastCategory ? 'bg-blue-500' : 'bg-gray-100'
          }`}
          onPress={handleQuickAdd}
          disabled={!amount || parseInt(amount, 10) === 0 || !lastCategory}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-semibold ${
              amount && parseInt(amount, 10) > 0 && lastCategory ? 'text-white' : 'text-gray-300'
            }`}
          >
            추가하기
          </Text>
        </TouchableOpacity>

        {!lastCategory && (
          <Text className="text-xs text-gray-300 text-center mt-2">
            먼저 카테고리를 선택한 후 기록이 필요합니다
          </Text>
        )}
      </Card>
    </View>
  )
}
