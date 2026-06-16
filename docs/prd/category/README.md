# Category 도메인 PRD

## 1. 기능 개요

수입/지출 카테고리 관리. 기본 제공되는 시스템 카테고리와 사용자 정의 카테고리 생성, 아이콘/명칭 변경, 정렬 순서 관리.

## 2. 데이터 모델

```typescript
// src/entities/category/model/types.ts

interface Category {
  id: string
  name: string           // 최대 20자
  icon: string           // emoji 또는 icon name
  type: 'income' | 'expense' | 'saving'
  isSystem: boolean      // 시스템 제공 카테고리 여부
  order: number          // 표시 순서
  userId?: string        // 사용자 정의인 경우
}
```

## 3. API 인터페이스

```typescript
// src/entities/category/api/index.ts

const CATEGORY_KEYS = {
  all: () => ['categories'] as const,
  byType: (type: string) => ['categories', { type }] as const,
  detail: (id: string) => ['categories', id] as const,
}

createCategoryApi(supabase: SupabaseClient): {
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category>
  delete(id: string): Promise<void>
  reorder(categoryIds: string[]): Promise<void>
  listSystemCategories(): Promise<Category[]>
  listUserCategories(userId: string): Promise<Category[]>
}

useCategories(type?: string): UseQueryResult<Category[]>
useCreateCategory(): UseMutationResult<Category, Error, CreateCategoryInput>
useUpdateCategory(): UseMutationResult<Category, Error, { id: string; input: UpdateCategoryInput }>
useDeleteCategory(): UseMutationResult<void, Error, string>
```

## 4. 주요 유저 플로우

```
[Settings] → [카테고리 관리] → [CategoryManager Screen]
                                          │
                                          ├── [카테고리 탭: 수입/지출/저축]
                                          ├── [+ 추가] → [카테고리 생성 모달]
                                          ├── [아이템 탭] → [편집 모달]
                                          ├── [드래그] → [순서 변경]
                                          └── [스와이프] → [삭제]
```

## 5. UI 이벤트 스크립트

### 5.1 CategoryManagerScreen

```typescript
// Events: src/features/category/category-manager/CategoryManager.tsx

// ===== 화면 진입 =====
onScreenFocus() {
  // 1. 시스템 카테고리 Fetch
  queryClient.fetchQuery({
    queryKey: CATEGORY_KEYS.byType('expense'),
  }).then(categories => {
    setCategories(categories)
    setFilteredCategories(categories)
  })

  // 2. 사용자 카테고리 Fetch
  queryClient.fetchQuery({
    queryKey: CATEGORY_KEYS.byType('expense'),
    queryFn: () => listUserCategories(currentUser.id),
  })
}

// ===== 타입 탭 변경 =====
onTypeTabChange(type: 'income' | 'expense' | 'saving') {
  // 1. 탭 UI 업데이트
  setSelectedType(type)

  // 2. 해당 타입 카테고리 필터링
  const filtered = categories.filter(c => c.type === type)
  setFilteredCategories(filtered)

  // 3. 카테고리 그리드 리렌더링
  AnimatedLayout.configure(config => {
    return config.animate in true
  })
}

// ===== 카테고리 선택 =====
onCategorySelect(category: Category) {
  // 1. 선택 상태 설정
  setSelectedCategoryId(category.id)

  // 2. 편집 모달 오픈
  if (category.isSystem) {
    // 시스템 카테고리는 편집 불가 안내
    showToast('시스템 카테고리는 수정할 수 없습니다')
  } else {
    openEditModal(category)
  }
}

// ===== 드래그 시작 =====
onDragStart() {
  // 1. 햅티 feedback
  Haptics.impact('medium')

  // 2. 드래그 모드 진입
  setIsDragging(true)

  // 3. 다른 항목들 살짝 투명하게
  setDraggedItemOpacity(0.5)
}

// ===== 드래그 중 =====
onDragMove(translationY: number) {
  // 1. 아이템 위치 실시간 업데이트
  updateItemPosition(categoryId, translationY)

  // 2.Swap 가능한 영역 계산
  const swapIndex = calculateSwapIndex(translationY)
  if (swapIndex !== currentIndex) {
    // 2-1. Swap 애니메이션 트리거
    Animated.spring(swapIndex, {
      toValue: currentIndex,
      useNativeDriver: true,
    })

    // 2-2. 데이터 배열 swap
    setFilteredCategories(prev => {
      const newArr = [...prev]
      ;[newArr[currentIndex], newArr[swapIndex]] = [newArr[swapIndex], newArr[currentIndex]]
      return newArr
    })

    // 2-3. 햅티 feedback
    Haptics.selectionChanged()
  }
}

// ===== 드래그 종료 =====
onDragEnd() {
  setIsDragging(false)

  // 1. 서버에 순서 저장
  saveCategoryOrder(filteredCategories.map(c => c.id))

  // 2. Query invalidation
  queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
}

// ===== 순서 저장 =====
async function saveCategoryOrder(categoryIds: string[]) {
  try {
    await reorderCategories(categoryIds)
    showToast('순서가 저장되었습니다')
  } catch (error) {
    // 실패 시 원래 순서로 롤백
    queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    showToast('순서 저장 실패')
  }
}
```

### 5.2 CategoryCreateModal / CategoryEditModal

```typescript
// Events: 카테고리 생성/편집 모달

// ===== 아이콘 선택 =====
onIconSelect(icon: string) {
  setSelectedIcon(icon)

  // 아이콘 미리보기 업데이트
  setPreviewIcon(icon)
}

// ===== 카테고리명 입력 =====
onNameChange(text: string) {
  // 1. 최대 20자 제한
  if (text.length > 20) return

  // 2. 실시간 미리보기
  setPreviewName(text)
}

// ===== 색상 선택 =====
onColorSelect(color: string) {
  setSelectedColor(color)
}

// ===== 저장 버튼 =====
onSave() {
  // ===== Validation =====
  if (!selectedIcon) {
    showToast('아이콘을 선택해주세요')
    return
  }

  if (!name.trim()) {
    showToast('카테고리명을 입력해주세요')
    nameInputRef.current?.focus()
    return
  }

  executeSave()
}

async function executeSave() {
  setIsSubmitting(true)

  try {
    const input = {
      name: name.trim(),
      icon: selectedIcon,
      type: selectedType,
      userId: currentUser.id,
    }

    await createCategory(input)

    queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    onClose()
    showToast('카테고리가 추가되었습니다')

  } catch (error) {
    showToast('생성 실패')
  } finally {
    setIsSubmitting(false)
  }
}

async function executeUpdate() {
  setIsSubmitting(true)

  try {
    await updateCategory(categoryId, {
      name: name.trim(),
      icon: selectedIcon,
    })

    queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all() })
    onClose()
    showToast('수정되었습니다')

  } catch (error) {
    showToast('수정 실패')
  } finally {
    setIsSubmitting(false)
  }
}
```

### 5.3 CategoryPicker (그리드 셀렉터)

```typescript
// Events: AddEntryModal 등에서 사용되는 카테고리 선택 그리드

// ===== 카테고리 아이템 탭 =====
onCategoryItemPress(category: Category) {
  // 1. 선택 상태 설정
  setSelectedCategoryId(category.id)

  // 2. 체크 애니메이션
  Animated.sequence([
    Animated.scale(1.2, { duration: 100 }),
    Animated.scale(1, { duration: 100 }),
  ])

  // 3. 선택 완료 후 부모에 알림
  onSelect(category)

  // 4. 모달 닫기 (선택 시)
  if (closeOnSelect) {
    setTimeout(() => onClose(), 200)
  }
}

// ===== 카테고리 아이템 롱프레스 =====
onCategoryItemLongPress(category: Category) {
  // 시스템 카테고리가 아닐 경우만
  if (category.isSystem) return

  // 1. 햅티 feedback
  Haptics.impact('heavy')

  // 2. 컨텍스트 메뉴 표시
  showCategoryContextMenu({
    category,
    options: [
      { label: '편집', onPress: () => openEditModal(category) },
      { label: '삭제', onPress: () => onDeleteCategory(category), destructive: true },
    ],
  })
}

// ===== 검색 필터 =====
onSearchFilterChange(text: string) {
  setSearchQuery(text)

  // 필터링
  const filtered = allCategories.filter(c =>
    c.name.toLowerCase().includes(text.toLowerCase())
  )
  setFilteredCategories(filtered)
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 카테고리 목록 | `useCategories()` | TanStack Query |
| 선택된 카테고리 | `CategoryPicker` | `useState` |
| 필터링된 목록 | `CategoryManagerScreen` | `useState` |
| 드래그 순서 | `CategoryManagerScreen` | `useState` + local DB |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 시스템 카테고리 삭제 시도 | 토스트 "시스템 카테고리는 삭제할 수 없습니다" |
| 카테고리명 중복 | "이미 존재하는 카테고리명입니다" 에러 표시 |
| 아이콘 미선택 | 저장 버튼 비활성화 |
| 순서 저장 실패 | 원래 순서로 자동 롤백 |
| 카테고리 사용 중 삭제 | "사용 중인 카테고리는 삭제할 수 없습니다" 확인 다이얼로그 |