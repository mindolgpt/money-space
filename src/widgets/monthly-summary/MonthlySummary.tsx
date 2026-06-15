import { View, Text } from "react-native";
import { useEffect, useRef } from "react";
import Animated, { useAnimatedProps, withTiming, useSharedValue, withSpring } from "react-native-reanimated";

interface Props {
  year: number;
  month: number;
  income: number;
  expense: number;
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = 0;
    animatedValue.value = withTiming(value, { duration: 600 });
  }, [value]);

  return <Text className={className}>{value.toLocaleString()}</Text>;
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
          <AnimatedNumber value={income} className="text-lg font-bold text-blue-500" />
        </View>
        <View className="items-center flex-1">
          <Text className="text-red-500 text-sm">지출</Text>
          <AnimatedNumber value={expense} className="text-lg font-bold text-red-500" />
        </View>
        <View className="items-center flex-1">
          <Text className="text-green-500 text-sm">잔액</Text>
          <AnimatedNumber value={balance} className="text-lg font-bold text-green-500" />
        </View>
      </View>
    </View>
  );
}
