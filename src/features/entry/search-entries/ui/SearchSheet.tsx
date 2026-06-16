import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import { useSearchStore } from '@/features/entry/search-entries/model/use-search-store'

type Props = {
  onClose: () => void
}

export function SearchSheet({ onClose }: Props) {
  const { query, results, search } = useSearchStore()

  return (
    <View className="flex-1 pt-16">
      <View className="flex-row items-center px-4 mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-3"
          placeholder="검색 (메모, 금액)"
          value={query}
          onChangeText={search}
          autoFocus
        />
        <TouchableOpacity className="ml-3" onPress={onClose}>
          <Text className="text-blue-500">닫기</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between py-3 px-4 border-b border-gray-100">
            <View className="flex-1">
              <Text>{item.note || '내역'}</Text>
              <Text className="text-xs text-gray-400">{item.date}</Text>
            </View>
            <Text
              className={
                item.type === 'income' ? 'text-blue-500' : 'text-red-500'
              }
            >
              {item.amount.toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          query ? (
            <Text className="text-center text-gray-400 mt-8">
              검색 결과가 없습니다
            </Text>
          ) : null
        }
      />
    </View>
  )
}
