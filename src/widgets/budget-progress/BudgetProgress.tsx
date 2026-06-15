import { View, Text } from "react-native";

interface Props {
  categoryName: string;
  spent: number;
  budget: number;
}

export function BudgetProgress({ categoryName, spent, budget }: Props) {
  const pct = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm">{categoryName}</Text>
        <Text className={`text-sm ${isOver ? "text-red-500" : "text-gray-500"}`}>
          {spent.toLocaleString()} / {budget.toLocaleString()}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}
