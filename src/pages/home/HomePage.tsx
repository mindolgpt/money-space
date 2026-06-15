import { View, ScrollView, TouchableOpacity, Text, Modal } from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";
import { MonthlySummary } from "../../widgets/monthly-summary/MonthlySummary";
import { RecentEntries } from "../../widgets/recent-entries/RecentEntries";
import { EntryForm, useEntryFormStore } from "../../features/add-entry";

export function HomePage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const { isOpen, open, close } = useEntryFormStore();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (user) {
      const data = getEntriesByMonth(user.id, year, month);
      setEntries(data);
    }
  }, [user]);

  const income = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <MonthlySummary year={year} month={month} income={income} expense={expense} />
      <RecentEntries entries={entries} />
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={open}>
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <EntryForm onClose={close} />
      </Modal>
    </ScrollView>
  );
}
