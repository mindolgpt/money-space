import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { X } from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
import { Toggle } from '@/shared/ui'
import type { EntryType } from '@/entities/entry'
import { CategoryPicker } from '@/features/entry/add-entry/ui/CategoryPicker'
import { PaymentMethodSelector } from '@/features/entry/add-entry/ui/PaymentMethodSelector'
import { DatePicker } from '@/features/entry/add-entry/ui/DatePicker'
import { LocationPicker } from '@/features/entry/add-entry/ui/LocationPicker'
import { useEditEntry } from '../model/use-edit-entry'

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
  const {
    isLoading,
    type,
    amount,
    categoryId,
    date,
    paymentMethod,
    note,
    isShared,
    isRecurring,
    latitude,
    longitude,
    locationName,
    isPending,
    setType,
    setCategoryId,
    setDate,
    setPaymentMethod,
    setNote,
    setIsShared,
    setIsRecurring,
    setLocation,
    onAmountChange,
    formatAmountDisplay,
    onSave,
    onDelete,
  } = useEditEntry(entryId, onClose, onSuccess)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-primary">
        <ActivityIndicator size="large" color={colors.accentGreen} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center"
            onPress={onClose}
          >
            <X size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-text-primary">거래 수정</Text>
          <TouchableOpacity onPress={onDelete}>
            <Text className="text-body-md text-accent-red">삭제</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <View className="flex-row gap-2 mb-4">
            {ENTRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                className={`flex-1 py-2.5 rounded-full items-center ${
                  type === t.key ? 'bg-accent-green' : 'bg-bg-tertiary'
                }`}
                onPress={() => setType(t.key)}
              >
                <Text
                  className={`text-label-md font-semibold ${
                    type === t.key ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="items-center py-6 px-4">
            <Text className="text-label-md font-semibold text-text-secondary tracking-widest uppercase mb-2">금액</Text>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-bold text-accent-green mr-1">₩</Text>
              <TextInput
                className="text-[36px] font-bold text-text-primary"
                style={{ letterSpacing: -0.72 }}
                placeholder="0"
                keyboardType="numeric"
                value={formatAmountDisplay(amount)}
                onChangeText={onAmountChange}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          <CategoryPicker
            type={type}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />

          <DatePicker value={date} onChange={setDate} />

          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            locationName={locationName}
            onChange={setLocation}
          />

          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-label-md text-text-secondary">메모</Text>
              <Text className="text-label-sm text-text-tertiary">{note.length}/500</Text>
            </View>
            <TextInput
              className="input min-h-[80px]"
              placeholder="메모를 입력하세요"
              placeholderTextColor={colors.textTertiary}
              value={note}
              onChangeText={(t) => {
                if (t.length <= 500) setNote(t)
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row items-center justify-between mb-4 py-3 border-b border-border">
            <View>
              <Text className="text-label-md font-semibold text-text-primary">가족 공유</Text>
              <Text className="text-label-sm text-text-tertiary mt-0.5">
                가족과 거래를 공유합니다
              </Text>
            </View>
            <Toggle
              value={isShared}
              onToggle={() => setIsShared(!isShared)}
            />
          </View>

          <View className="flex-row items-center justify-between mb-6 py-3 border-b border-border">
            <View>
              <Text className="text-label-md font-semibold text-text-primary">반복 설정</Text>
              <Text className="text-label-sm text-text-tertiary mt-0.5">
                매월 자동으로 기록
              </Text>
            </View>
            <Toggle
              value={isRecurring}
              onToggle={() => setIsRecurring(!isRecurring)}
            />
          </View>

          <TouchableOpacity
            className={`py-3.5 rounded-lg items-center justify-center flex-row ${
              isPending || !amount || !categoryId
                ? 'bg-accent-green/60'
                : 'bg-accent-green'
            }`}
            onPress={onSave}
            disabled={isPending || !amount || !categoryId}
          >
            {isPending ? (
              <ActivityIndicator color={colors.white} className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-body-md">
              {isPending ? '저장 중...' : '저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
