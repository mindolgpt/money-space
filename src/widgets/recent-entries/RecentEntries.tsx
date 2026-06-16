import { View, Text, FlatList } from 'react-native'
import { Entry } from '@/entities/entry'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated'

type Props = {
  entries: Entry[]
}

type AnimatedEntryProps = {
  item: Entry
  index: number
}

function AnimatedEntry({ item, index }: AnimatedEntryProps) {
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: withDelay(
        index * 80,
        withSpring(1, { stiffness: 100, damping: 10 }),
      ),
      transform: [
        {
          translateY: withDelay(
            index * 80,
            withSpring(0, { stiffness: 100, damping: 10 }),
          ),
        },
      ],
    }),
    [index],
  )

  return (
    <Animated.View style={animStyle}>
      <View className="flex-row justify-between items-center py-3 px-4 border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-gray-800">{item.note || '내역'}</Text>
          <Text className="text-gray-400 text-xs">{item.date}</Text>
        </View>
        <Text
          className={`font-bold ${
            item.type === 'income' ? 'text-blue-500' : 'text-red-500'
          }`}
        >
          {item.type === 'income' ? '+' : '-'}
          {item.amount.toLocaleString()}
        </Text>
      </View>
    </Animated.View>
  )
}

export function RecentEntries({ entries }: Props) {
  return (
    <View className="mt-4 mx-4 bg-white rounded-xl">
      <Text className="text-base font-bold p-4 pb-2">최근 내역</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedEntry item={item} index={index} />
        )}
        scrollEnabled={false}
      />
    </View>
  )
}
