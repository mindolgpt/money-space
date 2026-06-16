# Budget 도메인 PRD

## 1. 기능 개요

월별 예산 설정, 카테고리별 지출 한도 관리, 사용량.progress 추적 및 경고 알림.

## 2. 데이터 모델

```typescript
// src/entities/budget/model/types.ts

interface Budget {
  id: string
  userId?: string        // 개인 예산인 경우
  familyId?: string      // 가족 예산인 경우
  categoryId: string     // 해당 카테고리
  amount: number         // 예산 한도 (양수)
  month: string          // "2024-01" 형식
}
```

## 3. API 인터페이스

```typescript
// src/entities/budget/api/index.ts

const BUDGET_KEYS = {
  all: () => ['budgets'] as const,
  lists: () => ['budgets', 'list'] as const,
  list: (userId: string, month: string) =>
    ['budgets', 'list', { userId, month }] as const,
  detail: (id: string) => ['budgets', id] as const,
}

createBudgetApi(supabase: SupabaseClient): {
  create(userId: string, input: CreateBudgetInput): Promise<Budget>
  update(id: string, amount: number): Promise<Budget>
  delete(id: string): Promise<void>
  listByMonth(userId: string, month: string): Promise<Budget[]>
  getUsedAmount(categoryId: string, month: string): Promise<number>
}

useBudgets(userId: string, month: string): UseQueryResult<Budget[]>
useBudgetProgress(categoryId: string, month: string): UseQueryResult<{
  budget: number
  used: number
  remaining: number
  percent: number
}>
useCreateBudget(): UseMutationResult<Budget, Error, CreateBudgetInput>
useUpdateBudget(): UseMutationResult<Budget, Error, { id: string; amount: number }>
useDeleteBudget(): UseMutationResult<void, Error, string>
```

## 4. 주요 유저 플로우

```
[HOME] → [Budget Card tap] → [BudgetManager Modal]
                                 │
                                 ├── [카테고리별 예산 설정]
                                 ├── [한도 금액 입력]
                                 └── [저장] → [HOME Budget Card updated]
```

## 5. UI 이벤트 스크립트

### 5.1 BudgetManagerModal

```typescript
// Events: src/features/budget/budget-manager/BudgetManager.tsx

// ===== 모달 오픈 =====
onOpen(month?: string) {
  // 1. 대상 월 설정
  const targetMonth = month || getCurrentMonth() // "2024-01"
  setSelectedMonth(targetMonth)

  // 2. 해당 월 예산 데이터 Fetch
  queryClient.fetchQuery({
    queryKey: BUDGET_KEYS.list(currentUser.id, targetMonth),
  }).then(budgets => {
    // 3. 폼 초기화: budgetByCategory Map 생성
    const initial: Record<string, number> = {}
    budgets.forEach(b => {
      initial[b.categoryId] = b.amount
    })
    setBudgetAmounts(initial)
  })

  // 4. 카테고리별 사용량 Fetch
  fetchCategoryUsage(targetMonth)
}

async function fetchCategoryUsage(month: string) {
  const categories = await getCategoriesByType('expense')

  const usagePromises = categories.map(cat =>
    queryClient.fetchQuery({
      queryKey: ['budget', 'usage', cat.id, month],
      queryFn: () => getUsedAmount(cat.id, month),
    }).then(used => ({ categoryId: cat.id, used }))
  )

  const usages = await Promise.all(usagePromises)
  setCategoryUsage(Object.fromEntries(usages.map(u => [u.categoryId, u.used])))
}

// ===== 예산 금액 입력 =====
onBudgetAmountChange(categoryId: string, value: string) {
  // 1. 숫자만 허용
  const numericOnly = value.replace(/[^\d]/g, '')

  // 2. 최대 10자리
  if (numericOnly.length > 10) return

  // 3. 상태 업데이트
  setBudgetAmounts(prev => ({
    ...prev,
    [categoryId]: numericOnly ? parseInt(numericOnly) : 0,
  }))

  // 4. 실시간 progress 업데이트
  updateLiveProgress(categoryId, numericOnly ? parseInt(numericOnly) : 0)
}

function updateLiveProgress(categoryId: string, budgetAmount: number) {
  const used = categoryUsage[categoryId] || 0
  const remaining = budgetAmount - used
  const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0

  setLiveProgress(prev => ({
    ...prev,
    [categoryId]: { used, remaining, percent, isOverBudget: remaining < 0 }
  }))
}

// ===== 카테고리 탭 =====
onCategoryTabSelect(categoryId: string) {
  setSelectedCategoryId(categoryId)

  // 해당 카테고리 예산으로 스크롤/하이라이트
  budgetListRef.current?.scrollToItem(categoryId)
}

// ===== 월 변경 =====
onMonthChange(direction: 'prev' | 'next') {
  const newMonth = shiftMonth(selectedMonth, direction)
  setSelectedMonth(newMonth)

  // 새 월 데이터 Fetch
  onOpen(newMonth)
}

// ===== 저장 버튼 =====
onSave() {
  // ===== Validation =====
  // 1. 하나라도 설정되어있는지 체크
  const hasAnyBudget = Object.values(budgetAmounts).some(v => v > 0)
  if (!hasAnyBudget) {
    showToast('하나 이상의 예산을 설정해주세요')
    return
  }

  executeSave()
}

async function executeSave() {
  setIsSubmitting(true)

  try {
    // 1. 기존 예산 대비 변경분 계산
    const existingBudgets = await queryClient.fetchQuery({
      queryKey: BUDGET_KEYS.list(currentUser.id, selectedMonth),
    })

    const existingMap = Object.fromEntries(
      existingBudgets.map(b => [b.categoryId, b])
    )

    // 2. UPSERT: 변경분만 처리
    const savePromises = Object.entries(budgetAmounts).map(([categoryId, amount]) => {
      const existing = existingMap[categoryId]

      if (existing) {
        // Update
        if (existing.amount !== amount) {
          return amount === 0
            ? deleteBudget(existing.id)
            : updateBudget(existing.id, amount)
        }
        return Promise.resolve()
      } else if (amount > 0) {
        // Create
        return createBudget({
          userId: currentUser.id,
          categoryId,
          amount,
          month: selectedMonth,
        })
      }
    })

    await Promise.all(savePromises)

    // 3. QueryInvalidation
    queryClient.invalidateQueries({
      queryKey: BUDGET_KEYS.list(currentUser.id, selectedMonth),
    })

    // 4. Budget Card 위젯 refresh
    queryClient.invalidateQueries({ queryKey: ['budgets', 'progress'] })

    onClose()
    showToast('예산이 저장되었습니다')

  } catch (error) {
    showToast('저장에 실패했습니다')
  } finally {
    setIsSubmitting(false)
  }
}

// ===== 예산 삭제 (전체 초기화) =====
onClearAllBudgets() {
  showConfirmDialog({
    title: '예산 초기화',
    message: '모든 예산을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      await executeClearAll()
    },
  })
}

async function executeClearAll() {
  const existingBudgets = await queryClient.fetchQuery({
    queryKey: BUDGET_KEYS.list(currentUser.id, selectedMonth),
  })

  await Promise.all(existingBudgets.map(b => deleteBudget(b.id)))

  setBudgetAmounts({})
  queryClient.invalidateQueries({
    queryKey: BUDGET_KEYS.list(currentUser.id, selectedMonth),
  })

  showToast('예산이 초기화되었습니다')
}
```

### 5.2 BudgetProgress 위젯

```typescript
// Events: src/widgets/budget-progress/BudgetProgress.tsx

// Props: { categoryId: string, month: string }

// ===== 프로그레스 바 애니메이션 =====
useEffect(() => {
  // 1. 기존 progress에서 새 progress로 Animated.timing
  progressAnim.value = withTiming(percent, { duration: 500 })

  // 2. 임계점 초과 시 색상 변경
  if (percent >= 100) {
    // 빨간색으로 pulse 애니메이션
    opacityAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.6, { duration: 500 }),
      ),
      -1
    )
  }
}, [percent])

// ===== 카드 탭 =====
onCardPress() {
  // 1. 햅티 feedback
  Haptics.impact('light')

  // 2. BudgetManagerModal 오픈 (해당 카테고리 선택 상태로)
  openBudgetManager(categoryId)
}

// ===== 상세 보기 탭 =====
onDetailTap() {
  // 해당 카테고리 지출 내역으로 이동
  router.push(`/statistics?category=${categoryId}&month=${month}`)
}
```

### 5.3 BudgetCard (목록 아이템)

```typescript
// Events: 목록 내 개별 예산 카드

// ===== 스와이프 액세스 =====
onSwipeLeft(budgetId: string) {
  // 삭제 버튼 Reveal
  setSwipedBudgetId(budgetId)
}

// ===== 삭제 버튼 =====
onDeleteBudget(budgetId: string) {
  showConfirmDialog({
    title: '예산 삭제',
    message: '이 예산을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      await deleteBudget(budgetId)
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all() })
      showToast('삭제되었습니다')
    },
  })
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 월별 예산 목록 | `useBudgets()` | TanStack Query |
| 카테고리별 사용량 | `useBudgetProgress()` | TanStack Query |
| 폼 입력 상태 | `BudgetManagerModal` | `useState` |
| 선택된 월 | `BudgetManagerModal` | `useState` |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 예산 미설정 | BudgetCard "설정하기" CTA 표시 |
| 사용량 Fetch 실패 | "정보를 불러올 수 없습니다" 표시, 재시도 버튼 |
| 100% 초과 | 빨간색 진행바, pulse 애니메이션, 경고 아이콘 |
| 저장 실패 | 에러 토스트, 폼 상태 유지 |
| 카테고리 삭제 시 예산 존재 | 해당 예산도 함께 삭제 처리 |