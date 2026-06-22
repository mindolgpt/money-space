import { View, TextInput, Text } from 'react-native'

type Props = {
  value: string
  displayValue?: string
  onChange: (v: string) => void
}

export function AmountInput({ value, displayValue, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-text-secondary mb-2 font-medium">금액</Text>
      <View className="flex-row items-center bg-bg-tertiary rounded-xl px-4 py-4">
        <Text className="text-lg text-text-secondary mr-2 font-medium">₩</Text>
        <TextInput
          className="flex-1 text-xl font-semibold text-text-primary"
          placeholder="0"
          keyboardType="numeric"
          value={displayValue ?? value}
          onChangeText={onChange}
          placeholderTextColor="#C7C7CC"
        />
        {displayValue ? (
          <Text className="text-sm text-text-tertiary">{value.length}자리</Text>
        ) : null}
      </View>
    </View>
  )
}
