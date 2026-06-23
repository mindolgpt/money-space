import { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Search, Lightbulb, Film, Pill, Wallet, FileText, Utensils, ShoppingCart, Car, Coffee } from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useSearchEntries } from '@/entities/entry'
import { useDebounce } from '@/features/entry/search-entries/model/use-debounce'
import { colors } from '@/shared/lib/colors'
import type { Entry } from '@/entities/entry'

type Props = {
  onClose: () => void
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedText({ text, highlight, ...props }: { text: string; highlight: string } & React.ComponentProps<typeof Text>) {
  if (!highlight.trim()) {
    return <Text {...props}>{text}</Text>
  }

  const regex = new RegExp(`(${escapeRegex(highlight)})`, 'gi')
  const parts = text.split(regex)
  const matchRegex = new RegExp(`^${escapeRegex(highlight)}$`, 'i')

  return (
    <Text {...props}>
      {parts.map((part, i) =>
        matchRegex.test(part) ? (
          <Text key={i} style={{ backgroundColor: colors.accentGreen + '4D', fontWeight: '700' }}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  )
}

export function SearchSheet({ onClose }: Props) {
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'saving'>('all')
  const debouncedQuery = useDebounce(query, 300)

  const { data: results = [], isFetching, isLoading } = useSearchEntries(
    user?.id ?? '',
    debouncedQuery,
  )

  const filteredResults = useMemo(() => {
    if (typeFilter === 'all') return results
    return results.filter((e) => e.type === typeFilter)
  }, [results, typeFilter])

  const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
      food: Utensils, shopping: ShoppingCart, transport: Car, cafe: Coffee,
      entertainment: Film, health: Pill, salary: Wallet, etc: FileText,
    }
    const getCategoryIconComponent = (categoryId?: string) => {
      const Icon = ICON_MAP[categoryId ?? 'etc']
      return Icon ? <Icon size={18} color={colors.textTertiary} /> : <FileText size={18} color={colors.textTertiary} />
    }

  const getCategoryBg = (categoryId?: string) => {
    const colors: Record<string, string> = {
      food: 'bg-accent-red/10', shopping: 'bg-accent-orange/10',
      transport: 'bg-accent-yellow/10', cafe: 'bg-accent-orange/10',
      entertainment: 'bg-accent-purple/10', health: 'bg-accent-green/10',
      salary: 'bg-accent-green/10', etc: 'bg-bg-tertiary',
    }
    return colors[categoryId ?? 'etc'] ?? 'bg-bg-tertiary'
  }

  const onResultPress = (entry: Entry) => {
    router.push({ pathname: '/details', params: { id: entry.id } } as any)
    onClose()
  }

  const typeFilters: { key: typeof typeFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'expense', label: '지출' },
    { key: 'income', label: '수입' },
    { key: 'saving', label: '저축' },
  ]

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-bg-tertiary rounded-lg px-4 py-3">
            <Search size={20} color={colors.textTertiary} className="mr-3" />
            <TextInput
              className="flex-1 text-base text-text-primary"
              placeholder="검색 (메모, 금액)"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {isFetching && (
              <ActivityIndicator size="small" color={colors.accentGreen} />
            )}
          </View>
          <TouchableOpacity
            className="ml-3 px-3 py-2 rounded-lg bg-bg-tertiary"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text className="text-sm text-text-secondary">필터</Text>
          </TouchableOpacity>
          <TouchableOpacity className="ml-2" onPress={onClose}>
            <Text className="text-accent-green font-medium">취소</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="flex-row gap-2 mt-3">
            {typeFilters.map((f) => (
              <TouchableOpacity
                key={f.key}
                className={`px-3 py-1.5 rounded-full ${
                  typeFilter === f.key ? 'bg-accent-green' : 'bg-bg-tertiary'
                }`}
                onPress={() => setTypeFilter(f.key)}
              >
                <Text
                  className={`text-xs font-medium ${
                    typeFilter === f.key ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Result count */}
      {query.trim() && (
        <View className="px-4 pb-2">
          <Text className="text-xs text-text-tertiary">
            {filteredResults.length}건{filteredResults.length !== results.length ? ` (${results.length}건 중)` : ''}
          </Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row justify-between items-center py-4 px-5 border-b border-border active:bg-bg-secondary"
            onPress={() => onResultPress(item)}
          >
            <View className="flex-row items-center flex-1">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getCategoryBg(item.categoryId)}`}
              >
                {getCategoryIconComponent(item.categoryId)}
              </View>
              <View className="flex-1">
                <HighlightedText
                  className="text-sm font-medium text-text-primary"
                  text={item.note || item.categoryId || '내역'}
                  highlight={query}
                />
                <Text className="text-xs text-text-tertiary mt-0.5">
                  {item.date} · {item.paymentMethod ? (
                    { cash: '현금', card: '카드', account: '계좌', transfer: '이체' }[item.paymentMethod]
                  ) : '카드'}
                </Text>
              </View>
            </View>
            <HighlightedText
              className={`font-semibold ml-2 ${
                item.type === 'income'
                  ? 'amount-income'
                  : item.type === 'saving'
                    ? 'amount-saving'
                    : 'amount-expense'
              }`}
              text={`${item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}`}
              highlight={query}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="py-16 items-center">
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.accentGreen} />
            ) : query.trim() ? (
              <>
                <Search size={32} color={colors.textTertiary} className="mb-3" />
                <Text className="text-text-tertiary text-sm">검색 결과가 없습니다</Text>
              </>
            ) : (
              <>
                <Lightbulb size={32} color={colors.textTertiary} className="mb-3" />
                <Text className="text-text-tertiary text-sm">
                  메모나 금액으로 검색하세요
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  )
}
