import { Tabs } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { TabBar } from '@/shared/ui/TabBar'
function CustomTabBar(props: BottomTabBarProps) {
  return <TabBar state={props.state} navigation={props.navigation} descriptors={props.descriptors} insets={props.insets} />
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
