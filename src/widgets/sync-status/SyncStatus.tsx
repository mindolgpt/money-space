import { View, Text } from 'react-native'
import { useState } from 'react'
import { getDb } from '@/shared/lib'

export function SyncStatus() {
  const [pendingCount] = useState(() => {
    try {
      const rows = getDb().getAllSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM pending_changes WHERE status = 'pending'",
      )
      return rows[0]?.count ?? 0
    } catch {
      return 0
    }
  })

  if (pendingCount === 0) return null

  return (
    <View className="mt-2">
      <Text className="text-xs text-yellow-600">
        {pendingCount}개 항목 동기화 대기 중
      </Text>
    </View>
  )
}
