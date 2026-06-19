import { TouchableOpacity, View } from 'react-native'

type ToggleProps = {
  value: boolean
  onToggle: () => void
  disabled?: boolean
}

export function Toggle({ value, onToggle, disabled }: ToggleProps) {
  return (
    <TouchableOpacity
      className={`w-11 h-6 rounded-full justify-center px-0.5 ${value ? 'bg-blue-500' : 'bg-gray-200'}`}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white shadow-sm ${value ? 'self-end' : 'self-start'}`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  )
}
