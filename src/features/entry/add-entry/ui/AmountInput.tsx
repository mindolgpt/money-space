import { View, TextInput, Text } from 'react-native'

type Props = {
  value: string
  onChange: (v: string) => void
}

export function AmountInput({ value, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-1">금액</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
        <Text className="text-lg mr-2">₩</Text>
        <TextInput
          className="flex-1 text-lg"
          placeholder="0"
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
        />
      </View>
    </View>
  )
}
