import { View, Text } from "react-native";
import { useState } from "react";
import { getFamilyByUserId } from "../../entities/family";
import { useAuthStore } from "../../features/auth";
import { InviteScreen } from "../../features/family-invite";
import { TouchableOpacity } from "react-native";

export function SharedPage() {
  const { user } = useAuthStore();
  const [family] = useState(() => (user ? getFamilyByUserId(user.id) : null));

  if (!user) return null;

  if (!family) {
    return (
      <View className="flex-1">
        <InviteScreen familyId={""} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row p-4 bg-white border-b border-gray-200">
        {["전체", "개인", "공용"].map((tab) => (
          <TouchableOpacity key={tab} className="px-4 py-2 mr-2 rounded-full bg-gray-100">
            <Text>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">공유 내역이 없습니다</Text>
      </View>
    </View>
  );
}
