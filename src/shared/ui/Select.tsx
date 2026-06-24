import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, type ViewProps } from 'react-native'
import { ChevronDown } from 'lucide-react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'

type SelectOption = {
  value: string
  label: string
  icon?: string
  description?: string
}

type SelectProps = ViewProps & {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = '선택하세요',
  error,
  disabled,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  return (
    <View className={cn('mb-4', className)}>
      {label && (
        <Text className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-2">
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={cn(
          'flex-row items-center justify-between rounded-lg border border-border bg-bg-tertiary px-4 py-3.5',
          error && 'border-semantic-expense',
          disabled && 'opacity-50',
        )}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          className={cn(
            'text-body-md font-medium',
            selectedOption ? 'text-text-primary' : 'text-text-tertiary',
          )}
        >
          {selectedOption?.icon ? `${selectedOption.icon} ` : ''}
          {displayLabel}
        </Text>
        <ChevronDown size={18} color={colors.textTertiary} />
      </TouchableOpacity>
      {error && <Text className="text-label-sm text-semantic-expense mt-1">{error}</Text>}

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-primary">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text className="text-accent-green text-base font-semibold">취소</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text-primary">
              {label || '선택'}
            </Text>
            <View style={{ width: 48 }} />
          </View>
          <ScrollView className="flex-1">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <TouchableOpacity
                  key={option.value}
                  className={cn(
                    'flex-row items-center px-5 py-4 border-b border-border',
                    isSelected && 'bg-accent-green/10',
                  )}
                  onPress={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      {option.icon && (
                        <Text className="text-lg mr-2">{option.icon}</Text>
                      )}
                      <Text
                        className={cn(
                          'text-body-md font-medium',
                          isSelected ? 'text-accent-green' : 'text-text-primary',
                        )}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {option.description && (
                      <Text className="text-label-sm text-text-tertiary mt-0.5">
                        {option.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-accent-green items-center justify-center">
                      <Text className="text-white text-label-sm font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

export type { SelectOption }
