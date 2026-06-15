import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../features/auth";

export default function SettingsScreen() {
  const { signOut, user } = useAuthStore();

  return (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold mb-6">설정</Text>
      <Text className="text-gray-600 mb-8">{user?.email}</Text>
      <TouchableOpacity className="bg-red-500 rounded-lg p-3 items-center" onPress={signOut}>
        <Text className="text-white font-bold">로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
