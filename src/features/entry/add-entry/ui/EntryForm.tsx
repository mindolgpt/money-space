import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { X } from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
import { Button, Input, Toggle } from '@/shared/ui'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useCreateEntry, EntryType, PaymentMethod, CreateEntryInput } from '@/entities/entry'
import { useSetLastUsedCategory } from '@/entities/category'
import { CategoryPicker } from '@/features/entry/add-entry/ui/CategoryPicker'
import { PaymentMethodSelector } from '@/features/entry/add-entry/ui/PaymentMethodSelector'
import { DatePicker } from '@/features/entry/add-entry/ui/DatePicker'
import { PhotoPicker } from '@/features/entry/add-entry/ui/PhotoPicker'
import { LocationPicker } from '@/features/entry/add-entry/ui/LocationPicker'

type Props = {
  onClose: () => void
  onSuccess?: () => void
}

const ENTRY_TYPES: { key: EntryType; label: string; variant: 'green' | 'red' | 'blue' }[] = [
  { key: 'expense', label: '지출', variant: 'red' },
  { key: 'income', label: '수입', variant: 'green' },
  { key: 'saving', label: '저축', variant: 'blue' },
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
    <KeyboardAvoidingView
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 h-16 border-b border-border bg-bg-secondary/95">
        <TouchableOpacity onPress={onModalClose}>
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-body-md font-semibold text-text-primary">
          {form.type === 'expense' ? '지출 기록' : form.type === 'income' ? '수입 기록' : '저축 기록'}
        </Text>
        <TouchableOpacity
          className="bg-accent-green px-4 py-1.5 rounded-full"
          onPress={onSave}
          disabled={isPending || !form.amount || !form.categoryId}
          style={{ opacity: isPending || !form.amount || !form.categoryId ? 0.5 : 1 }}
        >
          <Text className="text-white text-label-md font-bold">완료</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Selector Pills */}
        <View className="flex-row gap-2 px-4 pt-4 pb-2">
          {ENTRY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              className={`px-4 py-1.5 rounded-full ${
                form.type === t.key ? 'bg-accent-green' : 'bg-bg-tertiary border border-border'
              }`}
              onPress={() => {
                onFieldChange('type', t.key)
                onFieldChange('categoryId', '')
              }}
            >
              <Text
                className={`text-label-md font-semibold ${
                  form.type === t.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount - Large Centered */}
        <View className="items-center py-8 px-4">
          <Text className="text-label-md font-semibold text-text-secondary tracking-widest uppercase mb-3">금액</Text>
          <View className="flex-row items-baseline">
            <Text className="text-headline-xl font-bold text-accent-green mr-1">₩</Text>
            <TextInput
              className="text-[36px] font-bold text-text-primary"
              style={{ letterSpacing: -0.72 }}
              placeholder="0"
              keyboardType="numeric"
              value={formatAmountDisplay(form.amount)}
              onChangeText={onAmountChange}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        <View className="px-4">
          {/* Category Grid */}
          <CategoryPicker
            type={form.type}
            selectedId={form.categoryId}
            onSelect={(id) => onFieldChange('categoryId', id)}
          />

          {/* Shared Toggle */}
          <View className="flex-row items-center justify-between py-4 px-4 mb-4 rounded-lg bg-bg-tertiary border border-border">
            <View className="flex-1 mr-3">
              <Text className="text-body-md font-semibold text-text-primary">피드에 공유하기</Text>
              <Text className="text-label-sm text-text-tertiary mt-0.5">
                가족과 거래를 공유합니다
              </Text>
            </View>
            <Toggle
              value={form.isShared}
              onToggle={() => onFieldChange('isShared', !form.isShared)}
            />
          </View>

          {/* Description - Underline Input */}
          <Input
            variant="underline"
            placeholder="어디에 쓰셨나요?"
            value={form.note}
            onChangeText={(t) => {
              if (t.length <= 500) onFieldChange('note', t)
            }}
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

          {/* Recurring Toggle */}
          <View className="flex-row items-center justify-between mb-6 py-3 border-b border-border">
            <View>
              <Text className="text-body-md font-semibold text-text-primary">반복 설정</Text>
              <Text className="text-label-sm text-text-tertiary mt-0.5">
                매월 자동으로 기록
              </Text>
            </View>
            <Toggle
              value={form.isRecurring}
              onToggle={() => onFieldChange('isRecurring', !form.isRecurring)}
            />
          </View>

          {/* Save Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={onSave}
            disabled={isPending || !form.amount || !form.categoryId}
          >
            {isPending ? '저장 중...' : '저장하기'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
