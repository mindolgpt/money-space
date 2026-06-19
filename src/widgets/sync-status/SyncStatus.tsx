import { View, Text, TouchableOpacity } from 'react-native'
import { useSyncStatus } from '@/entities/sync-queue'
import { useManualSync } from '@/features/sync/sync-engine'

export function SyncStatus() {
  const { data: status } = useSyncStatus()
  const { mutateAsync: manualSync, isPending } = useManualSync()

  const pendingCount = status?.pendingCount ?? 0
  const isSyncing = status?.isSyncing ?? false
  const isOnline = status?.isOnline ?? true

  if (!isOnline) {
    return (
      <View className="mt-2">
        <View className="badge" style={{ backgroundColor: 'rgba(255, 149, 0, 0.15)' }}>
          <Text className="text-accent-orange text-xs font-medium">
            📡 오프라인
          </Text>
        </View>
      </View>
    )
  }

  if (isSyncing) {
    return (
      <View className="mt-2">
        <View className="badge" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
          <Text className="text-accent-blue text-xs font-medium">
            🔄 동기화 중...
          </Text>
        </View>
      </View>
    )
  }

  if (pendingCount === 0) {
    return (
      <View className="mt-2">
        <View className="badge" style={{ backgroundColor: 'rgba(52, 199, 89, 0.15)' }}>
          <Text className="text-accent-green text-xs font-medium">
            ✓ 동기화 완료
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="mt-2 flex-row items-center gap-2">
      <View className="badge badge-yellow flex-1">
        <Text className="text-xs font-medium">
          ⏳ {pendingCount}개 동기화 대기
        </Text>
      </View>
      <TouchableOpacity
        className="py-1.5 px-3 rounded-lg bg-accent-blue/10"
        onPress={() => manualSync()}
        disabled={isPending}
      >
        <Text className="text-xs font-medium text-accent-blue">
          {isPending ? '...' : '동기화'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
