import { useState, useRef, useEffect } from 'react'
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
import { useAuthStore } from '@/features/auth/auth-manager'
import { useCreateEntry, EntryType, PaymentMethod, CreateEntryInput } from '@/entities/entry'
import { useSetLastUsedCategory } from '@/entities/category'
import { AmountInput } from '@/features/entry/add-entry/ui/AmountInput'
import { CategoryPicker } from '@/features/entry/add-entry/ui/CategoryPicker'
import { PaymentMethodSelector } from '@/features/entry/add-entry/ui/PaymentMethodSelector'
import { DatePicker } from '@/features/entry/add-entry/ui/DatePicker'
import { PhotoPicker } from '@/features/entry/add-entry/ui/PhotoPicker'
import { LocationPicker } from '@/features/entry/add-entry/ui/LocationPicker'

type Props = {
  onClose: () => void
  onSuccess?: () => void
}

const ENTRY_TYPES: { key: EntryType; label: string }[] = [
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
  { key: 'saving', label: '저축' },
]

const INITIAL_STATE = {
  type: 'expense' as EntryType,
  amount: '',
  categoryId: '' as string,
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'card' as PaymentMethod,
  note: '',
  photoUrls: [] as string[],
  isShared: false,
  isRecurring: false,
  recurringRule: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  locationName: undefined as string | undefined,
}

export function EntryForm({ onClose, onSuccess }: Props) {
  const { user } = useAuthStore()
  const { mutateAsync: createEntry, isPending } = useCreateEntry()
  const { mutateAsync: setLastUsed } = useSetLastUsedCategory()

  const [form, setForm] = useState(INITIAL_STATE)
  const [hasChanges, setHasChanges] = useState(false)
  const initialLoadRef = useRef(false)

  useEffect(() => {
    initialLoadRef.current = true
    return () => {
      initialLoadRef.current = false
    }
  }, [])

  const onFieldChange = <K extends keyof typeof INITIAL_STATE>(key: K, value: typeof INITIAL_STATE[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (!hasChanges && initialLoadRef.current) {
      setHasChanges(true)
    }
  }

  const onAmountChange = (text: string) => {
    const numeric = text.replace(/,/g, '').replace(/[^\d]/g, '')
    if (numeric.length > 12) return
    onFieldChange('amount', numeric)
  }

  const formatAmountDisplay = (val: string) => {
    if (!val) return ''
    return parseInt(val, 10).toLocaleString()
  }

  const isFutureDate = (dateStr: string) => {
    const today = new Date().toISOString().slice(0, 10)
    return dateStr > today
  }

  const showToast = (message: string) => {
    Alert.alert('', message)
  }

  const hasUnsavedChanges = () => hasChanges

  const onAddPhoto = (uri: string) => {
    if (form.photoUrls.length >= 5) {
      showToast('사진은 최대 5장까지 추가할 수 있습니다')
      return
    }
    onFieldChange('photoUrls', [...form.photoUrls, uri])
  }

  const onRemovePhoto = (index: number) => {
    onFieldChange('photoUrls', form.photoUrls.filter((_, i) => i !== index))
  }

  const onSave = () => {
    if (!user) return

    const amt = parseInt(form.amount, 10)
    if (!form.amount || amt === 0) {
      showToast('금액을 입력해주세요')
      return
    }

    if (!form.categoryId) {
      showToast('카테고리를 선택해주세요')
      return
    }

    if (isFutureDate(form.date)) {
      Alert.alert(
        '미래 날짜',
        '오늘 이후 날짜로 기록하시겠습니까?',
        [
          { text: '아니오', style: 'cancel' },
          { text: '예', onPress: executeSave },
        ],
      )
      return
    }

    executeSave()
  }

  const executeSave = async () => {
    if (!user) return

    const input: CreateEntryInput = {
      userId: user.id,
      amount: parseInt(form.amount, 10),
      type: form.type,
      categoryId: form.categoryId,
      date: form.date,
      paymentMethod: form.paymentMethod,
      note: form.note || undefined,
      photoUrls: form.photoUrls.length > 0 ? form.photoUrls : undefined,
      latitude: form.latitude,
      longitude: form.longitude,
      locationName: form.locationName,
      isShared: form.isShared,
      isRecurring: form.isRecurring,
      recurringRule: form.recurringRule || undefined,
    }

    try {
      await createEntry(input)

      await setLastUsed({
        userId: user.id,
        type: form.type,
        categoryId: form.categoryId,
      })

      setHasChanges(false)
      onClose()
      showToast('저장되었습니다')
      onSuccess?.()
    } catch {
      showToast('저장에 실패했습니다')
    }
  }

  const onModalClose = () => {
    if (isPending) return
    if (hasUnsavedChanges()) {
      Alert.alert(
        '변경사항이 있습니다',
        '저장하지 않고 닫으시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '닫기', onPress: onClose, style: 'destructive' },
        ],
      )
      return
    }
    onClose()
  }

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
            onPress={onModalClose}
          >
            <Text className="text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-primary">새 거래</Text>
          <View style={{ width: 32 }} />
        </View>

        <View className="p-4">
          {/* Type Selector */}
          <View className="flex-row gap-2 mb-4">
            {ENTRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                className={`flex-1 py-3 rounded-xl items-center ${
                  form.type === t.key ? 'bg-accent-blue' : 'bg-bg-tertiary'
                }`}
                onPress={() => {
                  onFieldChange('type', t.key)
                  onFieldChange('categoryId', '')
                }}
              >
                <Text
                  className={`text-sm font-medium ${
                    form.type === t.key ? 'text-white' : 'text-secondary'
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <AmountInput
            value={form.amount}
            displayValue={formatAmountDisplay(form.amount)}
            onChange={onAmountChange}
          />

          {/* Category */}
          <CategoryPicker
            type={form.type}
            selectedId={form.categoryId}
            onSelect={(id) => onFieldChange('categoryId', id)}
          />

          {/* Date */}
          <DatePicker
            value={form.date}
            onChange={(d) => onFieldChange('date', d)}
          />

          {/* Payment Method */}
          <PaymentMethodSelector
            value={form.paymentMethod}
            onChange={(v) => onFieldChange('paymentMethod', v)}
          />

          {/* Photos */}
          <PhotoPicker
            photoUrls={form.photoUrls}
            onAddPhoto={onAddPhoto}
            onRemovePhoto={onRemovePhoto}
          />

          {/* Location */}
          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            locationName={form.locationName}
            onChange={(loc) => {
              if (loc) {
                onFieldChange('latitude', loc.latitude)
                onFieldChange('longitude', loc.longitude)
                onFieldChange('locationName', loc.locationName)
              } else {
                onFieldChange('latitude', undefined)
                onFieldChange('longitude', undefined)
                onFieldChange('locationName', undefined)
              }
            }}
          />

          {/* Note */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-secondary">메모</Text>
              <Text className="text-xs text-tertiary">{form.note.length}/500</Text>
            </View>
            <TextInput
              className="input min-h-[80px]"
              placeholder="메모를 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={form.note}
              onChangeText={(t) => {
                if (t.length <= 500) onFieldChange('note', t)
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
              value={form.isShared}
              onValueChange={(v) => onFieldChange('isShared', v)}
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
              value={form.isRecurring}
              onValueChange={(v) => onFieldChange('isRecurring', v)}
              trackColor={{ false: '#F1F3F5', true: '#30D158' }}
              thumbColor="white"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`btn py-4 flex-row justify-center items-center ${
              isPending || !form.amount || !form.categoryId
                ? 'bg-accent-blue/60'
                : 'btn-primary'
            }`}
            onPress={onSave}
            disabled={isPending || !form.amount || !form.categoryId}
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