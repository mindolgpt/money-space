import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useEntry, useUpdateEntry, useDeleteEntry, EntryType, PaymentMethod, UpdateEntryInput } from '@/entities/entry'
import { AmountInput } from '@/features/entry/add-entry/ui/AmountInput'
import { CategoryPicker } from '@/features/entry/add-entry/ui/CategoryPicker'
import { PaymentMethodSelector } from '@/features/entry/add-entry/ui/PaymentMethodSelector'
import { DatePicker } from '@/features/entry/add-entry/ui/DatePicker'
import { LocationPicker } from '@/features/entry/add-entry/ui/LocationPicker'

type Props = {
  entryId: string
  onClose: () => void
  onSuccess?: () => void
}

const ENTRY_TYPES: { key: EntryType; label: string }[] = [
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
  { key: 'saving', label: '저축' },
]

export function EditEntryModal({ entryId, onClose, onSuccess }: Props) {
  const { data: entry, isLoading } = useEntry(entryId)
  const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateEntry()
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteEntry()

  const [type, setType] = useState<EntryType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [note, setNote] = useState('')
  const [isShared, setIsShared] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [locationName, setLocationName] = useState<string | undefined>()

  useEffect(() => {
    if (entry) {
      setType(entry.type)
      setAmount(entry.amount.toString())
      setCategoryId(entry.categoryId ?? '')
      setDate(entry.date)
      setPaymentMethod(entry.paymentMethod ?? 'card')
      setNote(entry.note ?? '')
      setIsShared(entry.isShared)
      setIsRecurring(entry.isRecurring)
      setLatitude(entry.latitude)
      setLongitude(entry.longitude)
      setLocationName(entry.locationName)
    }
  }, [entry])

  const onAmountChange = (text: string) => {
    const numeric = text.replace(/,/g, '').replace(/[^\d]/g, '')
    if (numeric.length > 12) return
    setAmount(numeric)
  }

  const formatAmountDisplay = (val: string) => {
    if (!val) return ''
    return parseInt(val, 10).toLocaleString()
  }

  const showToast = (message: string) => Alert.alert('', message)

  const onSave = async () => {
    if (!amount || parseInt(amount, 10) === 0) {
      showToast('금액을 입력해주세요')
      return
    }

    if (!categoryId) {
      showToast('카테고리를 선택해주세요')
      return
    }

    try {
      const input: UpdateEntryInput = {
        type,
        amount: parseInt(amount, 10),
        categoryId,
        date,
        paymentMethod,
        note: note || undefined,
        latitude,
        longitude,
        locationName,
        isShared,
        isRecurring,
      }
      await updateEntry({ id: entryId, input })
      showToast('수정되었습니다')
      onClose()
      onSuccess?.()
    } catch {
      showToast('수정에 실패했습니다')
    }
  }

  const onDelete = () => {
    Alert.alert(
      '기록 삭제',
      '이 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entryId)
              showToast('삭제되었습니다')
              onClose()
              onSuccess?.()
            } catch {
              showToast('삭제에 실패했습니다')
            }
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    )
  }

  const isPending = isUpdating || isDeleting

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-subtle">
          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-primary">거래 수정</Text>
          <TouchableOpacity onPress={onDelete}>
            <Text className="text-accent-red text-base">삭제</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {/* Type Selector (disabled for edit) */}
          <View className="flex-row gap-2 mb-4">
            {ENTRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                className={`flex-1 py-3 rounded-xl items-center ${
                  type === t.key ? 'bg-accent-blue' : 'bg-bg-tertiary'
                }`}
                onPress={() => setType(t.key)}
              >
                <Text
                  className={`text-sm font-medium ${
                    type === t.key ? 'text-white' : 'text-secondary'
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <AmountInput
            value={amount}
            displayValue={formatAmountDisplay(amount)}
            onChange={onAmountChange}
          />

          {/* Category */}
          <CategoryPicker
            type={type}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />

          {/* Date */}
          <DatePicker value={date} onChange={setDate} />

          {/* Payment Method */}
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          {/* Location */}
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            locationName={locationName}
            onChange={(loc) => {
              setLatitude(loc?.latitude)
              setLongitude(loc?.longitude)
              setLocationName(loc?.locationName)
            }}
          />

          {/* Note */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-secondary">메모</Text>
              <Text className="text-xs text-tertiary">{note.length}/500</Text>
            </View>
            <TextInput
              className="input min-h-[80px]"
              placeholder="메모를 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={(t) => {
                if (t.length <= 500) setNote(t)
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Shared Toggle */}
          <View className="flex-row items-center justify-between mb-4 py-3 border-b border-subtle">
            <View>
              <Text className="text-sm font-medium text-primary">가족 공유</Text>
              <Text className="text-xs text-tertiary mt-0.5">
                가족과 거래를 공유합니다
              </Text>
            </View>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ false: '#F1F3F5', true: '#30D158' }}
              thumbColor="white"
            />
          </View>

          {/* Recurring Toggle */}
          <View className="flex-row items-center justify-between mb-6 py-3 border-b border-subtle">
            <View>
              <Text className="text-sm font-medium text-primary">반복 설정</Text>
              <Text className="text-xs text-tertiary mt-0.5">
                매월 자동으로 기록
              </Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#F1F3F5', true: '#30D158' }}
              thumbColor="white"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`btn py-4 flex-row justify-center items-center ${
              isPending || !amount || !categoryId
                ? 'bg-accent-blue/60'
                : 'btn-primary'
            }`}
            onPress={onSave}
            disabled={isPending || !amount || !categoryId}
          >
            {isPending ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-base">
              {isPending ? '저장 중...' : '저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}