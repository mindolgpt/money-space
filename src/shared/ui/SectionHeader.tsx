import { View, Text } from 'react-native'

type SectionHeaderProps = {
  title: string
  action?: { label: string; onPress: () => void }
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-sm font-semibold text-text-primary tracking-tight">{title}</Text>
      {action && (
        <Text className="text-sm text-accent-blue font-semibold" onPress={action.onPress}>
          {action.label}
        </Text>
      )}
    </View>
  )
}
