import { View, TextInput, Text } from 'react-native'

type Props = {
  value: string
  displayValue?: string
  onChange: (v: string) => void
}

export function AmountInput({ value, displayValue, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-secondary mb-2">금액</Text>
      <View className="flex-row items-center bg-bg-tertiary rounded-xl px-4 py-4">
        <Text className="text-lg text-secondary mr-2">₩</Text>
        <TextInput
          className="flex-1 text-xl font-semibold text-primary"
          placeholder="0"
          keyboardType="numeric"
          value={displayValue ?? value}
          onChangeText={onChange}
          placeholderTextColor="#9CA3AF"
        />
        {displayValue ? (
          <Text className="text-sm text-tertiary">{value.length}자리</Text>
        ) : null}
      </View>
    </View>
  )
}