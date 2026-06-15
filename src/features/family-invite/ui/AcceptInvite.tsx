import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../auth";
import { useInviteStore } from "../model";
import { router } from "expo-router";

export function AcceptInvite({ code }: { code: string }) {
  const { user } = useAuthStore();
  const { acceptInvite, isLoading } = useInviteStore();

  const handleAccept = async () => {
    if (!user) return;
    await acceptInvite(code, user.id);
    router.replace("/(tabs)/shared");
  };

  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-xl font-bold mb-4">가계부 초대</Text>
      <Text className="text-gray-500 mb-6">
        배우자의 가계부에 초대되었습니다. 수락하시겠습니까?
      </Text>
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 px-8 items-center"
        onPress={handleAccept}
        disabled={isLoading}
      >
        <Text className="text-white font-bold">
          {isLoading ? "처리 중..." : "수락하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
