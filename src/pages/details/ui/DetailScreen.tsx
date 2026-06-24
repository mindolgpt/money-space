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
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { X, ArrowLeft, Trash2, Share2, Edit3 } from 'lucide-react-native'
import { useEntry, useDeleteEntry } from '@/entities/entry'
import { useCategory } from '@/entities/category'
import { EditEntryModal } from '@/features/entry/edit-entry'
import { colors } from '@/shared/lib/colors'
import { Card, Badge } from '@/shared/ui'

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <View className="flex-row py-3.5 px-0">
      <Text className="text-label-md font-semibold text-text-secondary w-20">{label}</Text>
      <Text className={`text-label-md font-semibold flex-1 ${isLink ? 'text-accent-green underline' : 'text-text-primary'}`} numberOfLines={isLink ? 1 : undefined}>
        {value}
      </Text>
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
      <View className="flex-1 bg-bg-primary items-center justify-center">
        <Text className="text-label-sm font-medium text-text-tertiary">로딩 중...</Text>
      </View>
    )
  }

  if (!entry) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center">
        <Text className="text-label-sm font-medium text-text-tertiary mb-4">내역을 찾을 수 없습니다</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-accent-green font-semibold">뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const typeLabel = entry.type === 'income' ? '수입' : entry.type === 'saving' ? '저축' : '지출'
  const paymentLabel = entry.paymentMethod
    ? ({ cash: '현금', card: '카드', account: '계좌', transfer: '이체' }[entry.paymentMethod] ?? entry.paymentMethod)
    : null

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.accentGreen} />
        </TouchableOpacity>
        <Text className="text-label-md font-semibold text-text-primary">내역 상세</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Edit3 size={20} color={colors.accentGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View className="items-center py-10 px-4">
          <Badge
            variant={entry.type === 'income' ? 'green' : entry.type === 'saving' ? 'green' : 'red'}
            label={typeLabel}
          />
          <Text className="text-[40px] font-bold text-text-primary mt-4 tracking-tight">
            ₩{entry.amount.toLocaleString()}
          </Text>
          {entry.note ? (
            <Text className="text-label-md font-medium text-text-secondary mt-2 text-center leading-5">{entry.note}</Text>
          ) : null}
        </View>

        {/* Details Card */}
        <View className="mx-4">
          <Card padded={false}>
            <View className="p-4">
              <Text className="text-label-md font-semibold text-text-primary mb-2 tracking-tight">상세 정보</Text>
              <DetailRow label="날짜" value={entry.date} />
              <View className="h-px bg-border" />
              <DetailRow label="카테고리" value={category?.name ?? '기타'} />
              <View className="h-px bg-border" />
              {paymentLabel ? (
                <>
                  <DetailRow label="결제수단" value={paymentLabel} />
                  <View className="h-px bg-border" />
                </>
              ) : null}
              {entry.locationName ? (
                <>
                  <DetailRow label="장소" value={entry.locationName} />
                  <View className="h-px bg-border" />
                </>
              ) : null}
              <DetailRow label="공유" value={entry.isShared ? '공유 중' : '나만 보기'} />
            </View>

            {/* Photos */}
            {entry.photoUrls && entry.photoUrls.length > 0 && (
              <View className="px-4 pb-4">
                <View className="h-px bg-border mb-3" />
                <Text className="text-label-md font-semibold text-text-primary mb-3 tracking-tight">사진</Text>
                <View className="flex-row gap-2">
                  {entry.photoUrls.map((url, index) => (
                    <Pressable key={index} onPress={() => setPhotoIndex(index)}>
                      <Image
                        source={{ uri: url }}
                        className="w-20 h-20 rounded-xl"
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 px-4 mt-6">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-bg-secondary border border-border"
            onPress={onShare}
          >
            <Share2 size={18} color={colors.textTertiary} />
            <Text className="text-label-md font-semibold text-text-primary ml-2">공유</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-semantic-expense/10"
            onPress={onDelete}
          >
            <Trash2 size={18} color={colors.accentRed} />
            <Text className="text-label-md font-semibold text-semantic-expense ml-2">삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Modal */}
      <Modal visible={photoIndex !== null} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/90 items-center justify-center"
          onPress={() => setPhotoIndex(null)}
        >
          {photoIndex !== null && entry?.photoUrls?.[photoIndex] && (
            <Image
              source={{ uri: entry.photoUrls[photoIndex] }}
              className="w-full h-[50%]"
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            className="absolute top-16 right-6 w-10 h-10 rounded-full bg-bg-secondary/20 items-center justify-center"
            onPress={() => setPhotoIndex(null)}
          >
            <X size={20} color={colors.white} />
          </TouchableOpacity>
        </Pressable>
      </Modal>

      {showEditModal && (
        <EditEntryModal
          entryId={id}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </View>
  )
}
