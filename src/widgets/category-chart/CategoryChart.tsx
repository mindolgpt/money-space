import { View, Text } from "react-native";
import { Entry } from "../../entities/entry";

interface Props {
  entries: Entry[];
  type: "expense" | "income";
}

export function CategoryChart({ entries, type }: Props) {
  const filtered = entries.filter((e) => e.type === type);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const grouped: Record<string, number> = {};
  for (const e of filtered) {
    const key = e.categoryId || "기타";
    grouped[key] = (grouped[key] || 0) + e.amount;
  }

  const sorted = Object.entries(grouped).sort(([, a], [, b]) => b - a);

  return (
    <View className="bg-white rounded-xl p-4 mx-4 mt-4">
      <Text className="text-base font-bold mb-4">
        {type === "expense" ? "지출 카테고리" : "수입 카테고리"}
      </Text>
      {sorted.map(([cat, amount]) => (
        <View key={cat} className="flex-row items-center mb-2">
          <View className="flex-1">
            <View className="h-4 bg-blue-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(amount / total) * 100}%` }}
              />
            </View>
          </View>
          <Text className="ml-2 text-sm w-20 text-right">
            {((amount / total) * 100).toFixed(0)}%
          </Text>
        </View>
      ))}
      {total === 0 && (
        <Text className="text-gray-400 text-center py-4">내역이 없습니다</Text>
      )}
    </View>
  );
}
