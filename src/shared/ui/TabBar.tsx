import { View, TouchableOpacity, Text } from 'react-native'
import { Home, BarChart3, Users, Calendar, Settings } from 'lucide-react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '@/shared/lib/colors'

const TAB_ACTIVE_BG = '#dae2fd'

const ROUTE_ICONS: Record<string, typeof Home> = {
  index: Home,
  statistics: BarChart3,
  shared: Users,
  calendar: Calendar,
  settings: Settings,
}

const ROUTE_LABELS: Record<string, string> = {
  index: '홈',
  statistics: '통계',
  shared: '공유',
  calendar: '캘린더',
  settings: '설정',
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View
      className="flex-row items-center justify-around px-4 bg-bg-secondary border-t border-border"
      style={{
        height: 64,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const Icon = ROUTE_ICONS[route.name]
        const label = ROUTE_LABELS[route.name]

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            className="items-center justify-center"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: isFocused ? TAB_ACTIVE_BG : 'transparent',
              minWidth: 56,
              height: 44,
            }}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              strokeWidth={isFocused ? 2.5 : 1.8}
              color={isFocused ? colors.accentGreen : colors.textTertiary}
            />
            <Text
              className="text-[11px] font-semibold mt-0.5"
              style={{
                color: isFocused ? colors.accentGreen : colors.textTertiary,
                letterSpacing: 0.3,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
