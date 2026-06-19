import { View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

type Props = {
  data: { label: string; value: number; icon?: string }[]
  title: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#FF453A',
  '#FF9F0A',
  '#FFD60A',
  '#30D158',
  '#BF5AF2',
  '#0A84FF',
  '#FF375F',
  '#64D2FF',
  '#AC8E68',
  '#8E8E93',
]

export function PieChart({ data, title, colors = DEFAULT_COLORS }: Props) {
  const selectedIndex = null
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (data.length === 0 || total === 0) {
    return (
      <View className="card p-4 mx-4 mt-4">
        <Text className="text-base font-semibold text-primary mb-4">{title}</Text>
        <View className="py-8 items-center">
          <Text className="text-tertiary text-sm">데이터가 없습니다</Text>
        </View>
      </View>
    )
  }

  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  const renderLegend = () => (
    <View className="mt-4">
      {data.slice(0, 6).map((item, index) => {
        const percentage = getPercentage(item.value)
        const isSelected = selectedIndex === index

        return (
          <Animated.View
            key={item.label}
            style={isSelected ? animatedStyle : undefined}
          >
            <Animated.View
              className="flex-row items-center py-2 px-3 rounded-lg mb-1"
              style={[
                { backgroundColor: isSelected ? `${colors[index % colors.length]}20` : 'transparent' },
              ]}
            >
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <Text className="flex-1 text-sm text-primary">
                {item.icon && `${item.icon} `}{item.label}
              </Text>
              <Text className="text-xs text-secondary">
                {percentage}%
              </Text>
              <Text className="text-xs text-tertiary ml-2 w-20 text-right">
                {item.value.toLocaleString()}원
              </Text>
            </Animated.View>
          </Animated.View>
        )
      })}
      {data.length > 6 && (
        <Text className="text-xs text-tertiary text-center mt-2">
          외 {data.length - 6}개
        </Text>
      )}
    </View>
  )

  return (
    <View className="card p-4 mx-4 mt-4">
      <Text className="text-base font-semibold text-primary mb-4">{title}</Text>

      <View className="items-center py-4">
        <View
          className="w-40 h-40 rounded-full overflow-hidden relative"
          style={{ backgroundColor: '#F1F3F5' }}
        >
          <View className="absolute inset-0 justify-center items-center">
            <Text className="text-2xl font-bold text-primary">
              {total.toLocaleString()}
            </Text>
            <Text className="text-xs text-secondary">원</Text>
          </View>
        </View>
      </View>

      {renderLegend()}
    </View>
  )
}