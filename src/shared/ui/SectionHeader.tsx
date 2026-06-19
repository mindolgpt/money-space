import { View, Text } from 'react-native'

type SectionHeaderProps = {
  title: string
  action?: { label: string; onPress: () => void }
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      {action && (
        <Text className="text-sm text-blue-500 font-medium" onPress={action.onPress}>
          {action.label}
        </Text>
      )}
    </View>
  )
}
