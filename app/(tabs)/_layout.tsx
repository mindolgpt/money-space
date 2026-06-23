import { Tabs } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { TabBar } from '@/shared/ui/TabBar'
function CustomTabBar(props: BottomTabBarProps) {
  return <TabBar state={props.state} navigation={props.navigation} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBar: (props) => <CustomTabBar {...props} />,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="shared" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
