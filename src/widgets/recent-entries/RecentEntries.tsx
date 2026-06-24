import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { type LucideIcon, Utensils, ShoppingCart, Car, Coffee, Film, Pill, Wallet, FileText, Edit3, Trash2 } from 'lucide-react-native'
import { removeEntryLocally, type Entry } from '@/entities/entry'
import { colors } from '@/shared/lib/colors'

type Props = {
  entries: Entry[]
}

type AnimatedEntryProps = {
  item: Entry
  index: number
}

function SwipeableEntry({ item, index }: AnimatedEntryProps) {
  const translateX = useRef(new Animated.Value(0)).current
  const isSwiped = useRef(false)
  const entryOpacity = useRef(new Animated.Value(0)).current
  const entryTranslateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start()
  }, [index, entryOpacity, entryTranslateY])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(gesture.dx, -160))
        } else {
          translateX.setValue(Math.min(gesture.dx, 80))
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -80) {
          Animated.spring(translateX, {
            toValue: -160,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start()
          isSwiped.current = true
        } else if (gesture.dx > 80) {
          Animated.spring(translateX, {
            toValue: 80,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start()
          isSwiped.current = true
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start()
          isSwiped.current = false
        }
      },
    }),
  ).current

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      stiffness: 200,
      damping: 20,
    }).start()
    isSwiped.current = false
  }

  const handlePress = () => {
    if (isSwiped.current) {
      resetSwipe()
      return
    }
    router.push({ pathname: '/details', params: { id: item.id } } as any)
  }

  const handleEdit = () => {
    resetSwipe()
    router.push({ pathname: '/details', params: { id: item.id, edit: '1' } } as any)
  }

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '이 거래를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel', onPress: resetSwipe },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            removeEntryLocally(item.id)
            resetSwipe()
          },
        },
      ],
    )
  }

  const getCategoryIcon = (categoryId?: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      food: Utensils,
      shopping: ShoppingCart,
      transport: Car,
      cafe: Coffee,
      entertainment: Film,
      health: Pill,
      salary: Wallet,
      etc: FileText,
    }
    return icons[categoryId || 'etc'] || FileText
  }

  const getCategoryColor = (categoryId?: string) => {
    const colors: Record<string, string> = {
      food: 'bg-semantic-expense/10', shopping: 'bg-accent-orange/10', transport: 'bg-accent-yellow/10',
      cafe: 'bg-accent-orange/10', entertainment: 'bg-accent-purple/10', health: 'bg-semantic-income/10',
      salary: 'bg-semantic-income/10', etc: 'bg-bg-tertiary',
    }
    return colors[categoryId || 'etc'] || 'bg-bg-tertiary'
  }

  return (
    <Animated.View style={{ opacity: entryOpacity, transform: [{ translateY: entryTranslateY }] }}>
      <View className="overflow-hidden">
        {/* Background actions */}
        <View className="absolute inset-y-0 right-0 flex-row">
          <TouchableOpacity
            className="w-20 bg-accent-green items-center justify-center"
            onPress={handleEdit}
          >
            <Edit3 size={16} color={colors.white} />
            <Text className="text-label-sm text-white mt-1">수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-20 bg-accent-red items-center justify-center"
            onPress={handleDelete}
          >
            <Trash2 size={16} color={colors.white} />
            <Text className="text-white text-xs mt-1">삭제</Text>
          </TouchableOpacity>
        </View>

        <View className="absolute inset-y-0 left-0">
          <TouchableOpacity
            className="w-20 bg-accent-red items-center justify-center"
            onPress={handleDelete}
          >
            <Trash2 size={16} color={colors.white} />
            <Text className="text-label-sm text-white mt-1">삭제</Text>
          </TouchableOpacity>
        </View>

        {/* Foreground entry row */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
          >
            <View className="flex-row items-center py-3.5 px-4 border-b border-border bg-bg-secondary">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getCategoryColor(item.categoryId)}`}>
                {(() => {
                  const IconComponent = getCategoryIcon(item.categoryId)
                  return <IconComponent size={16} color={colors.textTertiary} />
                })()}
              </View>
              <View className="flex-1">
                <Text className="text-label-md font-medium text-text-primary">
                  {item.note || '내역'}
                </Text>
                <Text className="text-label-sm text-text-tertiary mt-0.5">
                  {item.date} · {item.paymentMethod || '카드'}
                </Text>
              </View>
<Text
                  className={`text-label-md font-bold ${
                    item.type === 'income' ? 'text-semantic-income' : item.type === 'saving' ? 'text-semantic-saving' : 'text-semantic-expense'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}
                  {item.amount.toLocaleString()}
                </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

export function RecentEntries({ entries }: Props) {
  const displayEntries = entries.slice(0, 5)

  return (
    <View className="px-4 mt-2 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-body-lg font-semibold text-text-primary">최근 거래</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(tabs)/calendar' } as any)}
        >
          <Text className="text-label-md text-semantic-saving font-medium">전체 보기</Text>
        </TouchableOpacity>
      </View>
      {displayEntries.length === 0 ? (
          <View className="bg-bg-secondary rounded-lg py-8 items-center border border-border">
          <FileText size={32} color={colors.textTertiary} className="mb-2" />
          <Text className="text-label-md text-text-tertiary">첫 기록을 남겨보세요</Text>
        </View>
      ) : (
          <View className="bg-bg-secondary rounded-lg overflow-hidden border border-border">
          <FlatList
            data={displayEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SwipeableEntry item={item} index={index} />
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  )
}
