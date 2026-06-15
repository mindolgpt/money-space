import { View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";
import { MonthlySummary } from "../../widgets/monthly-summary/MonthlySummary";
import { CategoryChart } from "../../widgets/category-chart/CategoryChart";

export function StatisticsPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const now = new Date();

  useEffect(() => {
    if (user) {
      setEntries(getEntriesByMonth(user.id, now.getFullYear(), now.getMonth() + 1));
    }
  }, [user]);

  const income = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <MonthlySummary year={now.getFullYear()} month={now.getMonth() + 1} income={income} expense={expense} />
      <CategoryChart entries={entries} type="expense" />
      <CategoryChart entries={entries} type="income" />
    </ScrollView>
  );
}
