import { colors } from '@/shared/lib/colors'
import { View, TextInput, Text } from 'react-native'

type Props = {
  value: string
  displayValue?: string
  onChange: (v: string) => void
}

export function AmountInput({ value, displayValue, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-2">금액</Text>
      <View className="flex-row items-center bg-bg-tertiary rounded-lg px-4 py-4 border border-border">
        <Text className="text-lg font-bold text-accent-green mr-2">₩</Text>
        <TextInput
          className="flex-1 text-lg font-semibold text-text-primary"
          placeholder="0"
          keyboardType="numeric"
          value={displayValue ?? value}
          onChangeText={onChange}
          placeholderTextColor={colors.textTertiary}
        />
        {value ? (
          <Text className="text-xs text-text-tertiary">{value.length}자리</Text>
        ) : null}
      </View>
    </View>
  )
}
