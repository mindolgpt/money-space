import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { getDb } from "../../shared/lib/db";

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    try {
      const rows = getDb().getAllSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sync_queue"
      );
      setPendingCount(rows[0]?.count ?? 0);
    } catch {
      setPendingCount(0);
    }
  }, []);

  if (pendingCount === 0) return null;

  return (
    <View className="mt-2">
      <Text className="text-xs text-yellow-600">
        {pendingCount}개 항목 동기화 대기 중
      </Text>
    </View>
  );
}
