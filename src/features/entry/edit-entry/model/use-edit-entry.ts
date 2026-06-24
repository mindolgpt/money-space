import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { useEntry, useUpdateEntry, useDeleteEntry } from '@/entities/entry'
import type { EntryType, PaymentMethod, UpdateEntryInput } from '@/entities/entry'

export function useEditEntry(entryId: string, onClose: () => void, onSuccess?: () => void) {
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

  const setLocation = (loc: { latitude?: number; longitude?: number; locationName?: string } | undefined) => {
    setLatitude(loc?.latitude)
    setLongitude(loc?.longitude)
    setLocationName(loc?.locationName)
  }

  const onSave = async () => {
    if (!amount || parseInt(amount, 10) === 0) {
      Alert.alert('', '금액을 입력해주세요')
      return
    }
    if (!categoryId) {
      Alert.alert('', '카테고리를 선택해주세요')
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
      Alert.alert('', '수정되었습니다')
      onClose()
      onSuccess?.()
    } catch {
      Alert.alert('', '수정에 실패했습니다')
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
              Alert.alert('', '삭제되었습니다')
              onClose()
              onSuccess?.()
            } catch {
              Alert.alert('', '삭제에 실패했습니다')
            }
          },
        },
      ],
    )
  }

  const isPending = isUpdating || isDeleting

  return {
    entry,
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
  }
}
