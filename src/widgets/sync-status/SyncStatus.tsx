import { View, Text, TouchableOpacity } from 'react-native'
import { RefreshCw, Check, Clock } from 'lucide-react-native'
import { useSyncStatus } from '@/entities/sync-queue'
import { useManualSync } from '@/features/sync/sync-engine'
import { colors } from '@/shared/lib/colors'

export function SyncStatus() {
  const { data: status } = useSyncStatus()
  const { mutateAsync: manualSync, isPending } = useManualSync()

  const pendingCount = status?.pendingCount ?? 0
  const isSyncing = status?.isSyncing ?? false
  const isOnline = status?.isOnline ?? true

  if (!isOnline) {
    return (
      <View className="mt-2">
        <View className="px-2.5 py-1 rounded-full bg-accent-orange/15 self-start">
          <Text className="text-accent-orange text-xs font-medium">
            오프라인
          </Text>
        </View>
      </View>
    )
  }

  if (isSyncing) {
    return (
      <View className="mt-2">
        <View className="px-2.5 py-1 rounded-full bg-accent-green/15 self-start">
          <View className="flex-row items-center gap-1">
            <RefreshCw size={12} color={colors.accentGreen} />
            <Text className="text-accent-green text-xs font-medium">
              동기화 중...
            </Text>
          </View>
        </View>
      </View>
    )
  }

  if (pendingCount === 0) {
    return (
      <View className="mt-2">
        <View className="px-2.5 py-1 rounded-full bg-accent-green/15 self-start">
          <View className="flex-row items-center gap-1">
            <Check size={12} color={colors.accentGreen} />
            <Text className="text-accent-green text-xs font-medium">
              동기화 완료
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="mt-2 flex-row items-center gap-2">
      <View className="px-2.5 py-1 rounded-full bg-accent-yellow/15 flex-1 self-start">
        <View className="flex-row items-center gap-1">
          <Clock size={12} color={colors.accentOrange} />
          <Text className="text-xs font-medium text-accent-orange">
            {pendingCount}개 동기화 대기
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="py-1.5 px-3 rounded-lg bg-accent-green/10"
        onPress={() => manualSync()}
        disabled={isPending}
      >
        <Text className="text-xs font-semibold text-accent-green">
          {isPending ? '...' : '동기화'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
