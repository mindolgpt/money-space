import { View, Text } from 'react-native'

type SectionHeaderProps = {
  title: string
  action?: { label: string; onPress: () => void }
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-lg font-semibold text-text-primary">{title}</Text>
      {action && (
        <Text className="text-sm font-medium text-accent-green" onPress={action.onPress}>
          {action.label}
        </Text>
      )}
    </View>
  )
}
