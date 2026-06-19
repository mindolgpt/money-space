import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Share,
  Image,
  Pressable,
  Linking,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useEntry, useDeleteEntry } from '@/entities/entry'
import { useCategory } from '@/entities/category'
import { EditEntryModal } from '@/features/entry/edit-entry'
import { Card, Badge, IconCircle } from '@/shared/ui'

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <View className="flex-row py-3.5 px-4 border-b border-[rgba(0,0,0,0.04)]">
      <Text className="text-sm text-gray-400 w-20">{label}</Text>
      <Text className={`text-sm flex-1 ${isLink ? 'text-blue-500 underline' : 'text-gray-900'}`} numberOfLines={isLink ? 1 : undefined}>{value}</Text>
    </View>
  )
}

export function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: entry, isLoading, refetch } = useEntry(id)
  const { mutateAsync: deleteEntry } = useDeleteEntry()
  const [showEditModal, setShowEditModal] = useState(false)
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)

  const { data: category } = useCategory(entry?.categoryId ?? '')

  const onDelete = () => {
    Alert.alert('기록 삭제', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          try { await deleteEntry(entry!.id); router.back() }
          catch { Alert.alert('오류', '삭제에 실패했습니다') }
        },
      },
    ])
  }

  const onShare = async () => {
    if (!entry) return
    const typeLabel = entry.type === 'income' ? '수입' : entry.type === 'saving' ? '저축' : '지출'
    try {
      await Share.share({
        message: `[${typeLabel}] ₩${entry.amount.toLocaleString()}\n${entry.note ?? ''}\n${entry.date}${category ? `\n카테고리: ${category.name}` : ''}`,
      })
    } catch { /* silent */ }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-300">로딩 중...</Text>
      </View>
    )
  }

  if (!entry) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-300 mb-4">내역을 찾을 수 없습니다</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 font-medium">뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const typeLabel = entry.type === 'income' ? '수입' : entry.type === 'saving' ? '저축' : '지출'
  const paymentLabel = entry.paymentMethod
    ? ({ cash: '현금', card: '카드', account: '계좌', transfer: '이체' }[entry.paymentMethod] ?? entry.paymentMethod)
    : null

  return (
    <View className="flex-1 bg-[#F5F5F7]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[rgba(0,0,0,0.06)]">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500 text-base font-medium">← 뒤로</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-gray-900">내역 상세</Text>
          <TouchableOpacity onPress={() => setShowEditModal(true)}>
            <Text className="text-blue-500 text-base font-medium">수정</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center py-8 px-4">
          <IconCircle icon={category?.icon ?? '📝'} variant={entry.type === 'income' ? 'green' : entry.type === 'saving' ? 'blue' : 'red'} size="lg" />
          <View className="mt-3">
            <Text className={`text-3xl font-bold ${entry.type === 'income' ? 'text-emerald-500' : entry.type === 'saving' ? 'text-blue-500' : 'text-red-500'}`}>
              {entry.type === 'income' ? '+' : entry.type === 'saving' ? '' : '-'}₩{entry.amount.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-4">
            <Badge variant={entry.type === 'income' ? 'green' : entry.type === 'saving' ? 'blue' : 'red'} label={typeLabel} />
            {entry.isShared && <Badge variant="blue" label="공유" />}
            {entry.isRecurring && <Badge variant="purple" label="반복" />}
          </View>
        </View>

        <View className="px-4 mb-4">
          <Card padded={false} className="divide-y divide-[rgba(0,0,0,0.04)]">
            <DetailRow label="날짜" value={entry.date} />
            {category && <DetailRow label="카테고리" value={`${category.icon} ${category.name}`} />}
            {paymentLabel && <DetailRow label="결제수단" value={paymentLabel} />}
            {entry.note ? (
              <View className="py-3.5 px-4">
                <Text className="text-sm text-gray-400 mb-1">메모</Text>
                <Text className="text-sm text-gray-900">{entry.note}</Text>
              </View>
            ) : null}
            {entry.latitude != null && entry.longitude != null && (
              <TouchableOpacity className="flex-row py-3.5 px-4 items-center" onPress={() => { Linking.openURL(`https://maps.google.com/maps?q=${entry.latitude},${entry.longitude}`) }}>
                <Text className="text-sm text-gray-400 w-20">위치</Text>
                <Text className="text-sm text-blue-500 underline flex-1" numberOfLines={1}>
                  {entry.locationName ?? `${entry.latitude!.toFixed(4)}, ${entry.longitude!.toFixed(4)}`}
                </Text>
              </TouchableOpacity>
            )}
            <DetailRow label="생성일" value={new Date(entry.createdAt).toLocaleDateString('ko-KR')} />
            <DetailRow label="수정일" value={new Date(entry.updatedAt).toLocaleDateString('ko-KR')} />
          </Card>
        </View>

        {entry.photoUrls && entry.photoUrls.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-sm text-gray-400 mb-2">사진 ({entry.photoUrls.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {entry.photoUrls.map((url, i) => (
                <Pressable key={i} onPress={() => setPhotoIndex(i)}>
                  <Image source={{ uri: url }} className="w-24 h-24 rounded-xl mr-2 bg-gray-100" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="flex-row gap-3 px-4">
          <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-500 items-center" onPress={() => setShowEditModal(true)}>
            <Text className="text-white font-medium text-sm">수정</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-3 rounded-xl bg-gray-100 items-center" onPress={onShare}>
            <Text className="text-gray-500 font-medium text-sm">공유</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 px-5 rounded-xl bg-red-50 items-center" onPress={onDelete}>
            <Text className="text-red-500 font-medium text-sm">삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showEditModal && (
        <Modal visible animationType="slide">
          <EditEntryModal entryId={entry.id} onClose={() => setShowEditModal(false)} onSuccess={() => refetch()} />
        </Modal>
      )}

      {photoIndex !== null && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPhotoIndex(null)}>
          <Pressable className="flex-1 bg-black/90 items-center justify-center" onPress={() => setPhotoIndex(null)}>
            {entry.photoUrls?.[photoIndex] && (
              <Image source={{ uri: entry.photoUrls[photoIndex] }} className="w-full h-full resize-contain" />
            )}
            <TouchableOpacity className="absolute top-12 right-4" onPress={() => setPhotoIndex(null)}>
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}
