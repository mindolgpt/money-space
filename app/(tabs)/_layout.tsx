import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '통계',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="shared"
        options={{
          title: '공유',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👫</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  )
}
