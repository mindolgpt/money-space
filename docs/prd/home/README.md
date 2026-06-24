# Home (메인 화면)

## 1. 기능 개요

홈 화면은 사용자가 앱을 열었을 때 가장 먼저 보는 대시보드입니다.

- **월별 재무 요약**: 수입/지출/저축/잔액 한눈에 표시
- **최근 내역 목록**: 최근 5개 거래 표시, 탭 → 상세, 스와이프 → 수정/삭제
- **QuickInput**: 금액을 바로 입력하여 빠르게 기록 (Full flow 없이)
- **FAB**: + 버튼 → AddEntryModal 열기
- **동기화 상태 표시**: 미동기 항목 개수 표시
- **오프라인 배너**: 네트워크 미연결 시 표시
- **Pull-to-refresh**: 당겨서 데이터 갱신

## 2. 데이터 모델

Home 도메인은 별도의 엔티티를 가지지 않고 `entities/entry`를 직접 사용합니다.

```typescript
// src/entities/entry/model/types.ts 참조
interface Entry {
  id: string
  userId: string
  familyId?: string
  categoryId?: string
  amount: number
  type: 'income' | 'expense' | 'saving'
  paymentMethod?: 'cash' | 'card' | 'account' | 'transfer'
  note?: string
  date: string
  photoUrls?: string[]
  isShared: boolean
  isRecurring: boolean
  recurringRule?: string
  createdAt: string
  updatedAt: string
}
```

## 3. API 인터페이스

Home 화면은 `entities/entry` barrel의 `useEntries` hook을 사용합니다.

```typescript
// entities/entry barrel
const { data: entries = [] } = useEntries(userId, year, month)
```

QuickInput은 `features/sync/sync-engine`의 `createEntryLocally`를 직접 호출합니다.

```typescript
// sync engine
import { createEntryLocally } from '@/features/sync/sync-engine'
createEntryLocally({
  userId,
  amount,
  type,
  date,
  isShared,
  isRecurring,
})
```

## 4. 주요 유저 플로우

```
홈 화면 진입
  │
  ├─ 월별 요약 카드 표시 (수입/지출/저축/잔액)
  │
  ├─ 최근 내역 5개 표시
  │   ├─ 탭 → 상세 페이지 이동 (router.push(`/details?id=${id}`))
  │   └─ 스와이프
  │       ├─ 왼쪽 → 수정 (EditEntryModal)
  │       └─ 오른쪽 → 삭제 (ConfirmDialog)
  │
  ├─ QuickInput (바텀 영역)
  │   ├─ 금액 입력
  │   ├─ 타입 선택 (지출/수입/저축)
  │   └─ 추가 버튼 → 로컬 저장 + 동기화 큐
  │
  ├─ FAB (+) → AddEntryModal
  ├─ 검색 아이콘 → SearchSheet
  ├─ Pull-to-refresh → 데이터 갱신
  └─ 동기화 상태 표시 (pending count)
```

## 5. UI 이벤트 스크립트

### 5.1 HomeScreen

```typescript
// ===== Entry 탭 → 상세 =====
onEntryPress(entryId: string) {
  // 1. 햅틱 피드백
  Haptics.impact('light')
  // 2. navigate to details
  router.push(`/details?id=${entryId}`)
}

// ===== Entry 스와이프 (수정) =====
onSwipeEdit(entry: Entry) {
  // 1. 햅틱 피드백
  Haptics.impact('medium')
  // 2. EditEntryModal 열기
  openEditModal(entry)
}

// ===== Entry 스와이프 (삭제) =====
onSwipeDelete(entryId: string) {
  // 1. ConfirmDialog 표시
  // 2. 확인 시 removeEntryLocally(entryId)
  // 3. 성공 토스트
}

// ===== Pull-to-refresh =====
onRefresh() {
  // 1. useEntries refetch
  // 2. 최소 로딩 시간 300ms
  // 3. 에러 시 토스트
}

// ===== 검색 버튼 =====
onSearchPress() {
  // 1. 햅틱 피드백
  Haptics.impact('light')
  // 2. SearchSheet 모달 열기
}

// ===== FAB =====
onFABPress() {
  // 1. 햅틱 피드백
  Haptics.impact('medium')
  // 2. AddEntryModal 열기
}
```

### 5.2 RecentEntries Widget

```typescript
// ===== Entry 탭 =====
onEntryPress(entryId: string) {
  // 1. 햅틱 피드백
  Haptics.impact('light')
  // 2. router.push(`/details?id=${entryId}`)
}

// ===== 스와이프 시작 =====
onSwipeStart() {
  // 1. 햅틱 피드백
  Haptics.impact('light')
}

// ===== 스와이프 임계값 초과 =====
onSwipeThreshold(threshold: 'edit' | 'delete') {
  // 1. 버튼 표시 (편집/삭제 아이콘)
  // 2. 배경색 변경
}

// ===== 수정 실행 =====
onEdit(entry: Entry) {
  // 1. 햅틱 피드백
  // 2. EditEntryModal 열기
}

// ===== 삭제 실행 =====
onDelete(entryId: string) {
  // 1. ConfirmDialog
  // 2. 로컬 삭제 + 동기화 큐
}

// ===== "전체 보기" 탭 =====
onViewAll() {
  // 1. 햅틱 피드백
  // 2. 전체 내역 페이지 or Scroll 열기
}
```

### 5.3 QuickInput Widget

```typescript
// ===== 금액 입력 =====
onAmountChange(text: string) {
  // 1. 숫자만 허용
  // 2. 최대 12자리
  // 3. 콤마 포맷
}

// ===== 타입 선택 =====
onTypeSelect(type: EntryType) {
  // 1. 햅틱 피드백
  Haptics.selectionChanged()
  // 2. 선택된 타입 스타일 변경
}

// ===== 추가 버튼 =====
onQuickAdd() {
  // 1. 금액 검증 (0 또는 빈 값이면 무시)
  if (!amount || amount === 0) return
  // 2. 햅틱 피드백
  Haptics.notification('success')
  // 3. createEntryLocally 호출
  createEntryLocally({ userId, amount, type, date, isShared: false, isRecurring: false })
  // 4. 입력 초기화
  setAmount('')
  // 5. 토스트 "추가 완료"
}
```

### 5.4 MonthlySummary Widget

```typescript
// ===== 수입/지출/저축 애니메이션 =====
onAnimateNumbers() {
  // 1. 순차적 애니메이션 (100ms 간격)
  // 2. withDelay + withSpring
  // 3. opacity 0 → 1, translateY 20 → 0
}
```

### 5.5 SyncStatus Widget

```typescript
// ===== 동기화 대기 항목 표시 =====
onShowPendingCount() {
  // 1. SQLite 조회 (pending_count)
  // 2. 0이면 null 반환 (미표시)
  // 3. badge 표시
}
```

## 6. 주요 위젯

### 6.1 PeriodSelector

```typescript
// src/widgets/period-selector/PeriodSelector.tsx

export type PeriodType = 'week' | 'month' | 'year'

// Props
interface PeriodSelectorProps {
  selected: PeriodType
  onChange: (period: PeriodType) => void
}

// 기간 표시 라벨
getPeriodDisplayLabel(period: PeriodType, date: Date): string
// 주차 계산
getWeekNumber(date: Date): number
// 기간별 날짜 범위
getDateRangeForPeriod(period: PeriodType, date: Date): { start: Date; end: Date }
```

### 6.2 MonthlySummary

```typescript
// src/widgets/monthly-summary/MonthlySummary.tsx

interface MonthlySummaryProps {
  year: number
  month: number
  income: number
  expense: number
  saving?: number
}

// 월별 요약 카드
// 수입/지출/저축/잔액 4가지 항목 표시
// HomeScreen 상단에 표시
```

### 6.3 RecentEntries

```typescript
// src/widgets/recent-entries/RecentEntries.tsx

interface RecentEntriesProps {
  entries: Entry[]
}

// 최근 5개 거래 표시 (스와이프 가능)
// 왼쪽 스와이프: 수정 (초록)
// 오른쪽 스와이프: 삭제 (빨강)
// 탭: 상세 페이지 이동
// "전체 보기" 링크 → CalendarScreen 이동
```

### 6.4 QuickInput

```typescript
// src/widgets/quick-input/ui/QuickInput.tsx

interface QuickInputProps {
  onEntryAdded?: () => void
}

// 접이식 빠른 입력 폼
// 토글: 지출/수입/저축
// 마지막 사용 카테고리 표시
// 금액 입력 + 저장 버튼
// 저장 시 확인 다이얼로그
```

### 6.5 MonthlyComparisonChart

```typescript
// src/widgets/monthly-comparison/MonthlyComparisonChart.tsx

interface MonthlyComparisonProps {
  // 월별 비교 데이터 제공 hook
}

// 사용: StatisticsScreen에서 월별 수입/지출/저축 비교 표시
```

### 6.6 PieChart

```typescript
// src/widgets/pie-chart/PieChart.tsx

// 카테고리별 지출 비율을 원형 차트로 표시
// StatisticsScreen에서 사용
```

### 6.7 BudgetVsActual

```typescript
// src/widgets/budget-vs-actual/BudgetVsActual.tsx

interface BudgetVsActualProps {
  budget: Budget | null
  actualSpent: number
  category?: Category
}

// 예산 대비 실제 지출을 시각적으로 표시
// 초과 시 경고 애니메이션 (pulse)
// 색상: Green(<50%) → Yellow(50-79%) → Orange(80-99%) → Red(100%+)
```

### 6.8 CategoryChart

```typescript
// src/widgets/category-chart/CategoryChart.tsx

interface CategoryChartProps {
  entries: Entry[]
  type: 'expense' | 'income'
}

// 카테고리별 지출/수입 바 차트
// StatisticsScreen에서 사용
```

### 6.9 BudgetCard

```typescript
// src/widgets/budget-progress/BudgetCard.tsx

interface BudgetCardProps {
  budget: Budget
  categoryName: string
  categoryIcon?: string
  spent: number
  onEdit?: () => void
}

// 스와이프로 삭제 가능한 예산 카드
// BudgetManagerScreen에서 사용
```

### 6.10 SyncStatus

```typescript
// src/widgets/sync-status/SyncStatus.tsx

// 동기화 상태 표시 위젯
// isSyncing: 회전 애니메이션
// isOnline: 오프라인 배너
// pendingCount: 대기 중인 항목 수
// onRefresh: 수동 동기화 트리거
```

## 7. 주요 페이지

### 7.1 StatisticsScreen

```typescript
// src/pages/statistics/ui/StatisticsScreen.tsx

// 기간 선택 (PeriodSelector: 주/월/연도)
// 월별 요약 (MonthlySummary)
// 지출 카테고리 차트 (CategoryChart)
// 예산 대비 지출 (BudgetVsActual)
// 월별 비교 차트 (MonthlyComparisonChart)
```

### 7.2 CalendarScreen

```typescript
// src/pages/calendar/ui/CalendarScreen.tsx

// 달력 뷰
// 특정 날짜 선택 시 해당 날짜의 내역 표시
// EntryItem 탭 → DetailScreen 이동
```

### 7.3 DetailScreen

```typescript
// src/pages/details/ui/DetailScreen.tsx

// Entry 상세 정보 표시
// 사진, 위치, 메모 등
// 수정/삭제 액션
```

### 7.4 SettingsScreen

```typescript
// src/pages/settings/ui/SettingsScreen.tsx

// 프로필 설정 (ProfileSettings)
// 알림 설정 (NotificationSettings)
// 테마 설정
// 데이터 내보내기 (DataExport)
// 데이터 가져오기 (DataImport)
// 가족 관리 (FamilyManagerScreen)
// 카테고리 관리 (CategoryManagerScreen)
// 계정 삭제 (DeleteAccount)
// 로그아웃
```

## 8. 상태 관리

| 상태 | 위치 | 방식 |
|------|------|------|
| 월별 entries 데이터 | HomeScreen | TanStack Query (`useEntries`) |
| EntryForm 모달 | HomeScreen | Zustand (`useEntryFormStore`) |
| Search 모달 | HomeScreen | `useState` (지역) |
| QuickInput | QuickInput | `useState` (지역) |
| 테마 | 전역 | Zustand (`useThemeStore`) |
| 인증 | 전역 | Zustand (`useAuthStore`) |

## 9. 폴백/에러 처리

| 상황 | 처리 |
|------|------|
| Entries 로딩 중 | Skeleton UI (카드 흐림 효과) |
| Entries 빈 배열 | EmptyState ("첫 기록을 남겨보세요") |
| Entries 에러 | ErrorState + retry 버튼 |
| QuickInput 금액 0 | 저장 버튼 비활성화 |
| 오프라인 | OfflineBanner 표시 |
| 동기화 실패 | SyncStatus badge 표시 |
