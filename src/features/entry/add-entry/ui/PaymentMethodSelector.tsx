import { View, Text } from 'react-native'
import { Chip } from '@/shared/ui'
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
      <Text className="text-label-md font-semibold text-text-secondary tracking-widest uppercase mb-2">결제수단</Text>
      <View className="flex-row flex-wrap gap-2">
        {METHODS.map((m) => (
          <Chip
            key={m.key}
            label={m.label}
            variant={value === m.key ? 'filled' : 'outlined'}
            color="green"
            size="md"
            onPress={() => onChange(m.key)}
          />
        ))}
      </View>
    </View>
  )
}