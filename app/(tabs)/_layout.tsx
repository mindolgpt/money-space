import { Tabs } from 'expo-router'
import { Home, BarChart3, Users, Calendar, Settings } from 'lucide-react-native'
import { useThemeStore } from '@/shared/lib/theme-provider'

function TabIcon({
  icon: Icon,
  focused,
}: {
  icon: typeof Home
  focused: boolean
}) {
  return (
    <Icon
      size={22}
      strokeWidth={focused ? 2.5 : 1.8}
    />
  )
}

export default function TabsLayout() {
  const { isDark } = useThemeStore()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#86868B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '통계',
          tabBarIcon: ({ focused }) => <TabIcon icon={BarChart3} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shared"
        options={{
          title: '공유',
          tabBarIcon: ({ focused }) => <TabIcon icon={Users} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => <TabIcon icon={Calendar} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <TabIcon icon={Settings} focused={focused} />,
        }}
      />
    </Tabs>
  )
}
