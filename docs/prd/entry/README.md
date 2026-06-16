# Entry 도메인 PRD

## 1. 기능 개요

수입, 지출, 저축 기록의 CRUD 및 검색 기능. 빠른 입력을 위한 Floating Action Button, 최근 기록 위젯, 달력/목록 뷰를 지원.

## 2. 데이터 모델

```typescript
// src/entities/entry/model/types.ts

type EntryType = 'income' | 'expense' | 'saving'
type PaymentMethod = 'cash' | 'card' | 'account' | 'transfer'

interface Entry {
  id: string
  userId: string
  familyId?: string           // 가족 공유 시 존재
  categoryId?: string
  amount: number             // 양수, 단위: 원
  type: EntryType
  paymentMethod?: PaymentMethod
  note?: string              // 최대 500자
  date: string               // ISO 8601: "2024-01-15"
  photoUrls?: string[]       // 영수증 사진 URL 배열
  isShared: boolean          // 가족 공유 여부
  isRecurring: boolean       // 반복 설정 여부
  recurringRule?: string     // rrule 형식 (예: "FREQ=MONTHLY")
  createdAt: string
  updatedAt: string
}

type CreateEntryInput = Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>
type UpdateEntryInput = Partial<Omit<Entry, 'id' | 'createdAt' | 'createdAt'>>
```

## 3. API 인터페이스

```typescript
// src/entities/entry/api/index.ts

// Query Keys
const ENTRY_KEYS = {
  all: () => ['entries'] as const,
  lists: () => ['entries', 'list'] as const,
  list: (userId: string, year: number, month: number) =>
    ['entries', 'list', { userId, year, month }] as const,
  details: () => ['entries', 'detail'] as const,
  detail: (id: string) => ['entries', 'detail', id] as const,
  search: (userId: string, query: string) =>
    ['entries', 'search', { userId, query }] as const,
}

// Factory (비React 코드용)
createEntryApi(supabase: SupabaseClient): {
  create(input: CreateEntryInput): Promise<Entry>
  update(id: string, input: UpdateEntryInput): Promise<Entry>
  delete(id: string): Promise<void>
  getById(id: string): Promise<Entry | null>
  listByMonth(userId: string, year: number, month: number): Promise<Entry[]>
  search(userId: string, query: string): Promise<Entry[]>
  createOffline(entry: CreateEntryInput): Promise<Entry>  // SQLite 우선
}

// Hooks (React 컴포넌트용)
useEntry(id: string): UseQueryResult<Entry | null>
useEntries(userId: string, year: number, month: number): UseQueryResult<Entry[]>
useSearchEntries(userId: string, query: string): UseQueryResult<Entry[]>
useCreateEntry(): UseMutationResult<Entry, Error, CreateEntryInput>
useUpdateEntry(): UseMutationResult<Entry, Error, { id: string; input: UpdateEntryInput }>
useDeleteEntry(): UseMutationResult<void, Error, string>
```

## 4. 주요 유저 플로우

### 4.1 빠른 기록 (Quick Entry)

```
[HOME] → [+ FAB tap] → [AddEntry Modal]
                         │
                         ├── [type toggle: expense/income/saving]
                         ├── [amount input] ← 숫자 키패드
                         ├── [category picker] ← 그리드 형태
                         ├── [date picker] ← 기본 오늘
                         ├── [payment method] ← 선택
                         ├── [note input] ← 선택
                         └── [저장] → [HOME updated]
```

### 4.2 기록 수정/삭제

```
[HOMEscreen] → [Entry Item tap] → [Details Page]
                                     │
                                     ├── [수정] → [EditEntry Modal] → 저장
                                     └── [삭제] → [Confirm Dialog] → 확인
```

## 5. UI 이벤트 스크립트

### 5.1 AddEntryModal

```typescript
// Events: src/features/entry/add-entry/ui/AddEntryModal.tsx

// ===== 모달 오픈 =====
onOpen() {
  // 1. 현재 날짜 기본값 설정
  setFormState({
    type: 'expense',
    amount: '',
    categoryId: null,
    date: today,
    paymentMethod: null,
    note: '',
    photoUrls: [],
    isShared: false,
  })

  // 2. 키패드 자동 포커스 (amount 필드)
  setTimeout(() => amountInputRef.current?.focus(), 100)
}

// ===== 타입 토글 =====
onTypeToggle(newType: EntryType) {
  // 1. UI 상태 즉시 업데이트
  setFormState(prev => ({ ...prev, type: newType, categoryId: null }))

  // 2. 카테고리 재선택 필요 안내 (카테고리가 이전 타입용だった場合)
  if (categoryId && !isCategoryCompatible(categoryId, newType)) {
    showToast('카테고리를 다시 선택해주세요')
  }
}

// ===== 금액 입력 =====
onAmountChange(text: string) {
  // 1. 숫자만 허용 (정규식: /^\d*$/))
  const numericOnly = text.replace(/[^\d]/g, '')

  // 2. 최대 12자리 체크
  if (numericOnly.length > 12) return

  // 3. 상태 업데이트
  setFormState(prev => ({ ...prev, amount: numericOnly }))

  // 4. 3자리마다 comma 포맷팅 표시용
  setDisplayAmount(formatWithCommas(numericOnly))
}

// ===== 카테고리 선택 =====
onCategorySelect(categoryId: string) {
  // 1. 선택된 카테고리 하이라이트
  setSelectedCategoryId(categoryId)

  // 2. 카테고리 이름 표시 업데이트
  const category = getCategoryById(categoryId)
  setCategoryName(category?.name || '')
}

// ===== 날짜 선택 =====
onDateSelect(date: Date) {
  // 1. UI 표시 업데이트
  setDisplayDate(formatDate(date)) // "2024년 1월 15일"

  // 2. ISO 포맷으로 상태 저장
  setFormState(prev => ({ ...prev, date: toISODateString(date) }))
}

// ===== 결제 수단 선택 =====
onPaymentMethodSelect(method: PaymentMethod) {
  setFormState(prev => ({ ...prev, paymentMethod: method }))
}

// ===== 메모 입력 =====
onNoteChange(text: string) {
  // 1. 최대 500자 제한
  if (text.length > 500) return

  setFormState(prev => ({ ...prev, note: text }))
  setCharCount(text.length)
}

// ===== 사진 추가 =====
onAddPhoto() {
  // 1. 이미지 피커 오픈
  launchImagePicker(async (uri) => {
    // 2. 이미지 리사이즈 (최대 1MB)
    const resizedUri = await resizeImage(uri, 1024, 1024, 0.8)

    // 3. 스토리지 업로드
    const url = await uploadPhoto(resizedUri, `entries/${userId}/${Date.now()}.jpg`)

    // 4. photoUrls 배열에 추가
    setFormState(prev => ({
      ...prev,
      photoUrls: [...(prev.photoUrls || []), url]
    }))
  })
}

// ===== 사진 삭제 =====
onRemovePhoto(index: number) {
  setFormState(prev => ({
    ...prev,
    photoUrls: prev.photoUrls?.filter((_, i) => i !== index)
  }))
}

// ===== 공유 토글 =====
onSharedToggle() {
  setFormState(prev => ({ ...prev, isShared: !prev.isShared }))
}

// ===== 저장 버튼 =====
onSave() {
  // ===== Validation =====
  // 1. 금액 필수 체크
  if (!formState.amount || parseInt(formState.amount) === 0) {
    showToast('금액을 입력해주세요')
    amountInputRef.current?.focus()
    return
  }

  // 2. 카테고리 필수 체크
  if (!formState.categoryId) {
    showToast('카테고리를 선택해주세요')
    return
  }

  // 3. 날짜 유효성 체크 (미래 날짜 경고)
  if (isFutureDate(formState.date)) {
    showConfirmDialog({
      title: '미래 날짜',
      message: '오늘 이후 날짜로 기록하시겠습니까?',
      confirmText: '예',
      cancelText: '아니오',
      onConfirm: () => executeSave(),
    })
    return
  }

  executeSave()
}

// ===== 실제 저장 실행 =====
async function executeSave() {
  // 1. 로딩 상태 ON
  setIsSubmitting(true)

  try {
    // 2. 로컬 SQLite에 먼저 저장
    const localEntry = await createEntryLocally({
      ...formState,
      amount: parseInt(formState.amount),
      userId: currentUser.id,
    })

    // 3. 화면 즉시 업데이트 (Optimistic Update)
    queryClient.setQueryData(
      ENTRY_KEYS.list(currentUser.id, selectedYear, selectedMonth),
      (old) => old ? [localEntry, ...old] : [localEntry]
    )

    // 4. 백그라운드 동기화 큐에 추가
    await addToSyncQueue({
      type: 'CREATE_ENTRY',
      payload: localEntry,
      createdAt: Date.now(),
    })

    // 5. 모달 닫기
    onClose()
    showToast('기록이 저장되었습니다')

  } catch (error) {
    // 6. 에러 발생 시 롤백
    queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
    showToast('저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    setIsSubmitting(false)
  }
}

// ===== 모달 닫기 =====
onClose() {
  // 1. 저장 중이면 닫기 금지
  if (isSubmitting) return

  // 2. 변경사항 있을 때 확인
  if (hasUnsavedChanges()) {
    showConfirmDialog({
      title: '변경사항이 있습니다',
      message: '저장하지 않고 닫으시겠습니까?',
      confirmText: '닫기',
      cancelText: '취소',
      onConfirm: () => {
        setIsVisible(false)
        resetForm()
      },
    })
    return
  }

  setIsVisible(false)
  resetForm()
}
```

### 5.2 EntryItem (리스트 아이템)

```typescript
// Events: src/widgets/recent-entries/RecentEntries.tsx

// ===== 항목 탭 =====
onEntryPress(entry: Entry) {
  // 1. 네비게이션
  router.push(`/details/${entry.id}`)

  // 2. Deep Link 준비 (나중에 사용)
  setLastViewedEntryId(entry.id)
}

// ===== 항목 스와이프 (수정/삭제) =====
onSwipeLeft(entry: Entry) {
  // 1. 액션 버튼 Reveal
  setSwipedEntryId(entry.id)

  // 2. 햅티フィードバック
  Haptics.impact('light')
}

onSwipeRight(entry: Entry) {
  // 1. 빠른 수정 ( amount만 변경)
  openQuickEditModal(entry)
}

// ===== 수정 버튼 탭 =====
onEditPress(entry: Entry) {
  // 1. 수정 모달 오픈
  openEditModal(entry)

  // 2. 스와이프 상태 초기화
  setSwipedEntryId(null)
}

// ===== 삭제 버튼 탭 =====
onDeletePress(entry: Entry) {
  // 1. 확인 다이얼로그
  showDeleteConfirmDialog({
    title: '기록 삭제',
    message: '이 기록을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: () => executeDelete(entry),
  })
}

async function executeDelete(entry: Entry) {
  try {
    // 2. 낙관적 업데이트 (즉시 UI 반영)
    queryClient.setQueryData(
      ENTRY_KEYS.list(currentUser.id, year, month),
      (old) => old?.filter(e => e.id !== entry.id) || []
    )

    // 3. 로컬 삭제
    await deleteEntryLocally(entry.id)

    // 4. 동기화 큐에 추가
    await addToSyncQueue({
      type: 'DELETE_ENTRY',
      payload: { id: entry.id },
      createdAt: Date.now(),
    })

    showToast('삭제되었습니다')

  } catch (error) {
    // 5. 실패 시 롤백
    queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })
    showToast('삭제 실패')
  }
}
```

### 5.3 QuickInput 위젯

```typescript
// Events: src/widgets/quick-input/QuickInput.tsx

// ===== FAB 탭 =====
onFabPress() {
  // 1. 애니메이션 트리거
  scaleFab(0.9).then(() => scaleFab(1))

  // 2. 햅티フィードバック
  Haptics.impact('medium')

  // 3. AddEntryModal 오픈
  openAddEntryModal()
}

// ===== 금액 바로 입력 =====
onAmountQuickInput(amount: number) {
  // 1. 마지막 사용 카테고리 가져오기
  const lastCategory = getLastUsedCategory()

  // 2. 확인 다이얼로그
  showQuickConfirmDialog({
    title: `${formatWithCommas(amount)}원`,
    message: `${lastCategory?.name || '카테고리'}로 기록`,
    confirmText: '저장',
    cancelText: '취소',
    onConfirm: () => {
      createEntryLocally({
        amount,
        categoryId: lastCategory?.id,
        type: 'expense',
        date: today,
        userId: currentUser.id,
      })
      showToast('저장되었습니다')
    },
  })
}
```

### 5.4 SearchEntries

```typescript
// Events: src/features/entry/search-entries/SearchEntries.tsx

// ===== 검색어 입력 =====
onSearchChange(text: string) {
  // 1. 디바운스 (300ms)
  debouncedSearch(text)

  // 2. 로딩 표시
  setIsSearching(true)

  // 3. 검색어 표시
  setSearchQuery(text)
}

// ===== 실제 검색 실행 (디바운스 핸들러) =====
async function executeSearch(query: string) {
  if (!query.trim()) {
    setResults([])
    setIsSearching(false)
    return
  }

  try {
    // 1. TanStack Query로 검색
    const results = await queryClient.fetchQuery({
      queryKey: ENTRY_KEYS.search(currentUser.id, query),
      queryFn: () => searchEntries(currentUser.id, query),
    })

    // 2. 결과 업데이트
    setResults(results)
    setSearchResultCount(results.length)

  } catch (error) {
    showToast('검색 실패')
  } finally {
    setIsSearching(false)
  }
}

// ===== 필터 토글 (날짜 범위) =====
onDateRangeToggle(range: DateRange) {
  setDateRange(range)

  // 기존 검색 결과 재필터링
  filterResultsByDateRange(results, range)
}

// ===== 필터 토글 (카테고리) =====
onCategoryFilterToggle(categoryId: string) {
  setSelectedCategories(prev =>
    prev.includes(categoryId)
      ? prev.filter(id => id !== categoryId)
      : [...prev, categoryId]
  )

  applyFilters()
}

// ===== 필터 초기화 =====
onClearFilters() {
  setDateRange(null)
  setSelectedCategories([])
  setSearchQuery('')
  setResults([])
}

// ===== 결과 항목 탭 =====
onResultPress(entry: Entry) {
  router.push(`/details/${entry.id}`)
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| Entry 목록 | `useEntries()` hook | TanStack Query |
| Entry 상세 | `useEntry()` hook | TanStack Query |
| 검색 결과 | `SearchEntries` local state | `useState` |
| 폼 상태 | `AddEntryModal` local state | `useState` |
| 필터 상태 | `SearchEntries` local state | `useState` |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 네트워크 오프라인 | SQLite에서 읽기, 동기화 큐에 추가 |
| 금액 입력 초과 | 최대 12자리 차단, 토스트 메시지 |
| 카테고리 미선택 | 저장 버튼 비활성화, 토스트 안내 |
| 삭제 실패 | 롤백, 에러 토스트 표시 |
| 검색 결과 없음 | 빈 상태 UI ("검색 결과가 없습니다") |
| 사진 업로드 실패 | 로컬 사진 유지, 재시도 옵션 |