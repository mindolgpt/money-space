import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { createEntryLocally } from '@/features/sync/sync-engine'
import { EntryType, PaymentMethod } from '@/entities/entry'
import { AmountInput } from '@/features/entry/add-entry/ui/AmountInput'
import { CategoryPicker } from '@/features/entry/add-entry/ui/CategoryPicker'
import { PaymentMethodSelector } from '@/features/entry/add-entry/ui/PaymentMethodSelector'

type Props = {
  onClose: () => void
}

export function EntryForm({ onClose }: Props) {
  const { user } = useAuthStore()
  const [type, setType] = useState<EntryType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [note, setNote] = useState('')
  const [isShared, setIsShared] = useState(false)

  const handleSubmit = () => {
    if (!user || !amount) return
    createEntryLocally({
      userId: user.id,
      amount: parseInt(amount.replace(/,/g, ''), 10),
      type,
      paymentMethod,
      note: note || undefined,
      date: new Date().toISOString().slice(0, 10),
      categoryId,
      isShared,
      isRecurring: false,
    })
    onClose()
  }

  return (
    <ScrollView className="p-6">
      <Text className="text-xl font-bold mb-6">새 기록</Text>

      <View className="flex-row mb-6">
        {(['expense', 'income', 'saving'] as EntryType[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`px-4 py-2 rounded-full mr-2 ${
              type === t ? 'bg-blue-500' : 'bg-gray-100'
            }`}
            onPress={() => {
              setType(t)
              setCategoryId(undefined)
            }}
          >
            <Text className={type === t ? 'text-white' : 'text-gray-700'}>
              {t === 'expense' ? '지출' : t === 'income' ? '수입' : '저축'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AmountInput value={amount} onChange={setAmount} />
      <CategoryPicker
        type={type}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
      />

      <View className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">메모</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="메모를 입력하세요"
          value={note}
          onChangeText={setNote}
        />
      </View>

      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-gray-700">부부 공유</Text>
        <Switch value={isShared} onValueChange={setIsShared} />
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold">저장</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
