import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { X, Zap } from 'lucide-react-native'
import { EntryType, createEntryLocally } from '@/entities/entry'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useLastUsedCategory } from '@/entities/category'
import { Card } from '@/shared/ui'
import { colors } from '@/shared/lib/colors'

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
          className="flex-row items-center justify-center py-3.5 rounded-lg border-2 border-dashed border-border bg-bg-secondary/50"
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}
        >
          <Zap size={16} color={colors.accentOrange} className="mr-2" />
          <Text className="text-sm font-medium text-text-secondary">빠른 입력</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="px-4 mb-1">
      <Card>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Zap size={16} color={colors.accentOrange} className="mr-2" />
            <Text className="text-sm font-semibold text-text-primary">빠른 입력</Text>
          </View>
          <TouchableOpacity
            className="w-6 h-6 rounded-full items-center justify-center bg-bg-tertiary"
            onPress={() => {
              setAmount('')
              setIsExpanded(false)
            }}
          >
            <X size={14} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-4">
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              className={`flex-1 py-2.5 rounded-md items-center ${
                type === t.key ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`}
              onPress={() => setType(t.key)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-medium ${
                  type === t.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {lastCategory && (
          <TouchableOpacity className="flex-row items-center bg-bg-tertiary rounded-lg px-3 py-2.5 mb-3">
            <Text className="text-base mr-2">{lastCategory.icon}</Text>
            <Text className="text-sm text-text-secondary flex-1">{lastCategory.name}</Text>
            <Text className="text-xs text-text-tertiary">마지막 사용</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center bg-bg-tertiary rounded-lg px-4 py-3 mb-3">
          <Text className="text-sm text-text-secondary mr-2">₩</Text>
          <TextInput
            className="flex-1 text-lg font-semibold text-text-primary"
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />
          {displayAmount ? (
            <Text
              className={`text-sm font-medium ${
                type === 'income' ? 'text-semantic-income' : type === 'saving' ? 'text-semantic-saving' : 'text-semantic-expense'
              }`}
            >
              {displayAmount}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          className={`py-3 rounded-lg items-center ${
            amount && parseInt(amount, 10) > 0 && lastCategory ? 'bg-accent-green' : 'bg-bg-tertiary'
          }`}
          onPress={handleQuickAdd}
          disabled={!amount || parseInt(amount, 10) === 0 || !lastCategory}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-semibold ${
              amount && parseInt(amount, 10) > 0 && lastCategory ? 'text-white' : 'text-text-tertiary'
            }`}
          >
            추가하기
          </Text>
        </TouchableOpacity>

        {!lastCategory && (
          <Text className="text-xs text-text-tertiary text-center mt-2">
            먼저 카테고리를 선택한 후 기록이 필요합니다
          </Text>
        )}
      </Card>
    </View>
  )
}
