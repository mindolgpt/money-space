import { View, Text, TouchableOpacity } from 'react-native'
import { PaymentMethod } from '@/entities/entry'

type Props = {
  value?: PaymentMethod
  onChange: (v: PaymentMethod) => void
}

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'cash', label: '현금' },
  { key: 'card', label: '카드' },
  { key: 'account', label: '계좌' },
  { key: 'transfer', label: '이체' },
]

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-2">결제수단</Text>
      <View className="flex-row">
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            className={`px-4 py-2.5 rounded-full mr-2 ${
              value === m.key ? 'bg-accent-green' : 'bg-bg-tertiary'
            }`}
            onPress={() => onChange(m.key)}
          >
            <Text
              className={`text-sm font-medium ${
                value === m.key ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}