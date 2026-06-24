import { type LucideIcon } from 'lucide-react-native'
import { View, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { cn } from '@/shared/lib/cn'
import { colors } from '@/shared/lib/colors'
import type { Entry } from '@/entities/entry'

type EntryItemProps = TouchableOpacityProps & {
  entry: Pick<Entry, 'id' | 'type' | 'amount' | 'note' | 'date' | 'categoryId' | 'paymentMethod'>
  icon?: LucideIcon
  iconVariant?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
  showBorderLeft?: boolean
  compact?: boolean
}

const variantBg: Record<string, string> = {
  green: 'bg-semantic-income/10',
  red: 'bg-semantic-expense/10',
  blue: 'bg-semantic-saving/10',
  orange: 'bg-accent-orange/10',
  purple: 'bg-accent-purple/10',
  gray: 'bg-bg-tertiary',
}

const variantColor: Record<string, string> = {
  green: colors.accentGreen,
  red: colors.accentRed,
  blue: colors.semanticSaving,
  orange: colors.accentOrange,
  purple: colors.accentPurple,
  gray: colors.textTertiary,
}

const typeAmountColor: Record<string, string> = {
  income: 'text-semantic-income',
  expense: 'text-semantic-expense',
  saving: 'text-semantic-saving',
}

export function EntryItem({
  entry,
  icon: IconComponent,
  iconVariant,
  showBorderLeft = true,
  compact = false,
  className,
  ...props
}: EntryItemProps) {
  const isIncome = entry.type === 'income'
  const resolvedVariant = iconVariant ?? (isIncome ? 'green' : 'gray')
  const IconEl = IconComponent

  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center bg-bg-secondary border border-border',
        compact ? 'p-3' : 'p-4',
        showBorderLeft && isIncome && 'border-l-4 border-l-accent-green',
        'rounded-xl',
        className,
      )}
      activeOpacity={0.7}
      {...props}
    >
      <View
        className={cn(
          compact ? 'w-9 h-9 mr-2.5' : 'w-12 h-12 mr-4',
          'rounded-full items-center justify-center',
          variantBg[resolvedVariant],
        )}
      >
        {IconEl ? (
          <IconEl
            size={compact ? 16 : 20}
            color={variantColor[resolvedVariant]}
          />
        ) : (
          <Text className={compact ? 'text-sm' : 'text-lg'}>
            {entry.note?.charAt(0) || '📝'}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text
          className={cn(
            'font-medium text-text-primary',
            compact ? 'text-label-md' : 'text-body-md',
          )}
          numberOfLines={1}
        >
          {entry.note || '내역'}
        </Text>
        <Text className="text-label-sm text-text-tertiary mt-0.5" numberOfLines={1}>
          {entry.date} · {entry.paymentMethod || '카드'}
        </Text>
      </View>

      <Text
        className={cn(
          'font-bold',
          compact ? 'text-label-md' : 'text-body-md',
          typeAmountColor[entry.type],
        )}
      >
        {entry.type === 'income' ? '+' : '-'}₩{entry.amount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  )
}
