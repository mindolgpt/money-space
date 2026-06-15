import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { getDb } from "../../../shared/lib/db";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface Props {
  type: "income" | "expense" | "saving";
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ type, selectedId, onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const rows = getDb().getAllSync<Record<string, any>>(
      "SELECT * FROM categories WHERE type = ? ORDER BY sort_order",
      [type]
    );
    setCategories(rows.map((r) => ({ id: r.id, name: r.name, icon: r.icon, type: r.type })));
  }, [type]);

  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-2">카테고리</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Animated.View
            style={useAnimatedStyle(() => ({
              transform: [{ scale: withSpring(selectedId === item.id ? 1.1 : 1, { stiffness: 150, damping: 8 }) }],
            }), [selectedId, item.id])}
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedId === item.id ? "bg-blue-500" : "bg-gray-100"
              }`}
              onPress={() => onSelect(item.id)}
            >
              <Text className={selectedId === item.id ? "text-white" : "text-gray-700"}>
                {item.icon} {item.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}
