import { View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { colors } from '@/shared/lib/colors'

type Props = {
  data: { label: string; value: number; icon?: string }[]
  title: string
  chartColors?: string[]
}

const DEFAULT_COLORS = [
  '#10b981',
  '#ba1a1a',
  '#565e74',
  '#a43a3a',
  '#5c647a',
  '#fc7c78',
  '#006c49',
  '#3c4a42',
  '#6c7a71',
  '#e5e7eb',
]

export function PieChart({ data, title, chartColors = DEFAULT_COLORS }: Props) {
  const selectedIndex = null
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (data.length === 0 || total === 0) {
    return (
      <View className="card p-4 mx-4 mt-4">
<Text className="text-body-md font-semibold text-text-primary mb-4">{title}</Text>
        <View className="py-8 items-center">
          <Text className="text-text-tertiary text-label-md">데이터가 없습니다</Text>
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
                { backgroundColor: isSelected ? `${chartColors[index % chartColors.length]}20` : 'transparent' },
              ]}
            >
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <Text className="flex-1 text-sm text-text-primary">
                {item.icon && `${item.icon} `}{item.label}
              </Text>
              <Text className="text-xs text-text-secondary">
                {percentage}%
              </Text>
              <Text className="text-xs text-text-tertiary ml-2 w-20 text-right">
                {item.value.toLocaleString()}원
              </Text>
            </Animated.View>
          </Animated.View>
        )
      })}
      {data.length > 6 && (
        <Text className="text-xs text-text-tertiary text-center mt-2">
          외 {data.length - 6}개
        </Text>
      )}
    </View>
  )

  return (
    <View className="card p-4 mx-4 mt-4">
      <Text className="text-base font-semibold text-text-primary mb-4">{title}</Text>

      <View className="items-center py-4">
        <View
          className="w-40 h-40 rounded-full overflow-hidden relative"
          style={{ backgroundColor: colors.bgElevated }}
        >
          <View className="absolute inset-0 justify-center items-center">
            <Text className="text-2xl font-bold text-text-primary">
              {total.toLocaleString()}
            </Text>
            <Text className="text-label-sm text-text-secondary">원</Text>
          </View>
        </View>
      </View>

      {renderLegend()}
    </View>
  )
}
