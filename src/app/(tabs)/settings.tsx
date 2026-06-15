import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../features/auth";
import { BudgetList } from "../../features/budget-manager";
import { SyncStatus } from "../../widgets/sync-status/SyncStatus";

export default function SettingsScreen() {
  const { signOut, user } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 pb-2">
        <Text className="text-xl font-bold mb-6">설정</Text>
        <View className="bg-white rounded-xl p-4 mb-6">
          <Text className="text-gray-800 font-medium">{user?.email}</Text>
          <SyncStatus />
          <TouchableOpacity
            className="bg-red-500 rounded-lg p-3 items-center mt-4"
            onPress={signOut}
          >
            <Text className="text-white font-bold">로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BudgetList />
    </ScrollView>
  );
}
