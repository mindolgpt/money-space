import { View, Text } from "react-native";

interface Props {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export function MonthlySummary({ year, month, income, expense }: Props) {
  const balance = income - expense;
  return (
    <View className="bg-white rounded-xl p-4 mx-4 mt-4 shadow">
      <Text className="text-lg font-bold text-center">
        {year}년 {month}월
      </Text>
      <View className="flex-row justify-between mt-4">
        <View className="items-center flex-1">
          <Text className="text-blue-500 text-sm">수입</Text>
          <Text className="text-lg font-bold text-blue-500">
            {income.toLocaleString()}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-red-500 text-sm">지출</Text>
          <Text className="text-lg font-bold text-red-500">
            {expense.toLocaleString()}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-green-500 text-sm">잔액</Text>
          <Text className="text-lg font-bold text-green-500">
            {balance.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
