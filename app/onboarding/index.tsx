import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useCategories } from '@/entities/category'
import { useUpdateSettings } from '@/entities/user'
import type { Category } from '@/entities/category'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface OnboardingSlide {
  id: string
  icon: string
  title: string
  description: string
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: '💰',
    title: '가계부 관리',
    description: '수입, 지출, 저축을 한눈에 관리하세요',
  },
  {
    id: '2',
    icon: '📊',
    title: '예산 설정',
    description: '카테고리별 예산 한도를 설정하고 지출을 컨트롤하세요',
  },
  {
    id: '3',
    icon: '👨‍👩‍👧‍👦',
    title: '가족 공유',
    description: '가족과 가계부를 공유하고 함께 관리하세요',
  },
  {
    id: '4',
    icon: '🔄',
    title: '자동 동기화',
    description: '오프라인에서도 기록하고 온라인에서 자동으로 동기화됩니다',
  },
]

export default function OnboardingScreen() {
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [notificationRequested, setNotificationRequested] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [step, setStep] = useState<'slides' | 'permission' | 'budget'>('slides')

  const { user, completeOnboarding } = useAuthStore()
  const { data: expenseCategories = [] } = useCategories('expense')
  const { mutateAsync: updateSettings } = useUpdateSettings()

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const page = Math.round(offsetX / SCREEN_WIDTH)
    setCurrentPage(page)
  }, [])

  const goToPage = useCallback((page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true })
    setCurrentPage(page)
  }, [])

  const handleNext = useCallback(() => {
    if (currentPage < SLIDES.length - 1) {
      goToPage(currentPage + 1)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setStep('permission')
    }
  }, [currentPage, goToPage])

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setStep('permission')
  }, [])

  const handleRequestNotificationPermission = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setNotificationRequested(true)
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        Alert.alert('알림 설정 완료', '예산 초과 시 알림을 받아보실 수 있습니다.')
      }
    } catch {
      // expo-notifications not installed, skip
    }
    setStep('budget')
  }, [])

  const handleSkipNotification = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setStep('budget')
  }, [])

  const toggleCategory = useCallback((categoryId: string) => {
    Haptics.selectionAsync()
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      if (prev.length >= 5) {
        Alert.alert('최대 5개까지 선택 가능')
        return prev
      }
      return [...prev, categoryId]
    })
  }, [])

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    if (user) {
      try {
        const budgetAmount = parseInt(budgetInput.replace(/[^\d]/g, ''), 10)
        if (budgetAmount > 0) {
          await updateSettings({
            userId: user.id,
            updates: {
              notifications: {
                budgetAlert: notificationRequested,
                recurringReminder: false,
                weeklySummary: false,
                monthlyReport: false,
              },
            },
          })
        }
      } catch {
        // settings update optional, continue
      }
    }

    await completeOnboarding()
    router.replace({ pathname: '/(tabs)' } as any)
  }, [user, budgetInput, notificationRequested, completeOnboarding, updateSettings])

  const renderSlides = () => (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.id}
            className="items-center justify-center px-8"
            style={{ width: SCREEN_WIDTH }}
          >
            <View className="w-32 h-32 rounded-full bg-bg-tertiary items-center justify-center mb-8">
              <Text className="text-6xl">{slide.icon}</Text>
            </View>
            <Text className="text-2xl font-bold text-primary mb-4 text-center">
              {slide.title}
            </Text>
            <Text className="text-base text-secondary text-center px-4">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-8">
        <View className="flex-row justify-center mb-6">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentPage ? 'bg-accent-blue' : 'bg-bg-tertiary'
              }`}
            />
          ))}
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 py-4 bg-bg-tertiary rounded-xl items-center"
            onPress={handleSkip}
          >
            <Text className="text-secondary font-medium">건너뛰기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-2 py-4 bg-accent-blue rounded-xl items-center px-8"
            onPress={handleNext}
          >
            <Text className="text-white font-semibold">
              {currentPage === SLIDES.length - 1 ? '시작하기' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderPermission = () => (
    <View className="flex-1 px-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-bg-tertiary items-center justify-center mb-6">
          <Text className="text-5xl">🔔</Text>
        </View>
        <Text className="text-2xl font-bold text-primary mb-3 text-center">
          알림 설정
        </Text>
        <Text className="text-base text-secondary text-center px-4">
          예산이 초과될 때 알림을 받아보시겠습니까?
        </Text>
      </View>

      <View className="mb-8">
        <TouchableOpacity
          className="py-4 bg-accent-blue rounded-xl items-center mb-3"
          onPress={handleRequestNotificationPermission}
        >
          <Text className="text-white font-semibold">알림 허용</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-4 bg-bg-tertiary rounded-xl items-center"
          onPress={handleSkipNotification}
        >
          <Text className="text-secondary font-medium">나중에 설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderBudget = () => (
    <ScrollView className="flex-1 px-6 py-8">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-bg-tertiary items-center justify-center mb-4">
          <Text className="text-4xl">💵</Text>
        </View>
        <Text className="text-xl font-bold text-primary mb-2 text-center">
          첫 예산 설정
        </Text>
        <Text className="text-sm text-secondary text-center">
          한 달 예산을 입력하시면 지출을 더 잘 관리할 수 있어요
        </Text>
      </View>

      <View className="card p-5 mb-4">
        <Text className="text-sm text-secondary mb-2">월 예산 금액</Text>
        <View className="flex-row items-center">
          <TextInput
            className="input flex-1 text-lg py-3"
            placeholder="예) 1000000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={budgetInput}
            onChangeText={(text) => {
              const numeric = text.replace(/[^\d]/g, '')
              setBudgetInput(numeric ? parseInt(numeric, 10).toLocaleString() : '')
            }}
          />
          <Text className="text-base text-secondary ml-2">원</Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold text-primary mb-3">
          주요 카테고리 선택 (선택)
        </Text>
        <Text className="text-xs text-secondary mb-3">
          빠른 입력을 위해 자주 사용할 카테고리를 선택하세요
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {expenseCategories.slice(0, 8).map((cat: Category) => (
            <TouchableOpacity
              key={cat.id}
              className={`px-4 py-2.5 rounded-full border ${
                selectedCategories.includes(cat.id)
                  ? 'bg-accent-blue border-accent-blue'
                  : 'bg-transparent border-border'
              }`}
              onPress={() => toggleCategory(cat.id)}
            >
              <Text
                className={`text-sm ${
                  selectedCategories.includes(cat.id)
                    ? 'text-white font-medium'
                    : 'text-primary'
                }`}
              >
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="py-4 bg-accent-blue rounded-xl items-center"
        onPress={handleComplete}
      >
        <Text className="text-white font-semibold text-base">
          Money Space 시작하기
        </Text>
      </TouchableOpacity>

      <Text className="text-xs text-tertiary text-center mt-4">
        예산과 카테고리는 나중에 설정에서도 변경할 수 있어요
      </Text>
    </ScrollView>
  )

  return (
    <View className="flex-1 bg-bg-primary pt-12">
      {step === 'slides' && renderSlides()}
      {step === 'permission' && renderPermission()}
      {step === 'budget' && renderBudget()}
    </View>
  )
}