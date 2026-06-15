import { View, ScrollView, TouchableOpacity, Text, Modal } from "react-native";
import { useEffect, useState } from "react";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";
import { MonthlySummary } from "../../widgets/monthly-summary/MonthlySummary";
import { RecentEntries } from "../../widgets/recent-entries/RecentEntries";
import { EntryForm, useEntryFormStore } from "../../features/add-entry";
import { SearchSheet } from "../../features/search-entries";

export function HomePage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const { isOpen, open, close } = useEntryFormStore();
  const [isSearchOpen, setSearchOpen] = useState(false);
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

  const fabAnim = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { stiffness: 200, damping: 8 }) }],
  }), []);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-6 pt-4">
        <Text className="text-lg font-bold">Money Space</Text>
        <TouchableOpacity className="p-2" onPress={() => setSearchOpen(true)}>
          <Text className="text-xl">🔍</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isSearchOpen} animationType="slide">
        <SearchSheet onClose={() => setSearchOpen(false)} />
      </Modal>
      <MonthlySummary year={year} month={month} income={income} expense={expense} />
      <RecentEntries entries={entries} />
      <Animated.View style={fabAnim}>
        <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={open}>
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      </Animated.View>
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <EntryForm onClose={close} />
      </Modal>
    </ScrollView>
  );
}
