# AI 에이전트 프롬프트 예시 카드

> 아래 템플릿을 복사해서 사용하세요.

---

## 🔧 기능 구현

### AddEntryModal 완성
```
너는 Money-Space 개발자야.
src/features/entry/add-entry/ui/AddEntryModal.tsx 구현해줘.

docs/prd/entry/README.md "5.1 AddEntryModal" 참조.
docs/prd/shared/README.md 컴포넌트 규칙 준수.
@/entities/entry barrel에서 useCreateEntry hook 사용.
FSD 구조 (model/, ui/) 준수.
```

### QuickInput 위젯
```
너는 Money-Space 개발자야.
src/widgets/quick-input/QuickInput.tsx FAB 위젯 구현해줘.

docs/prd/entry/README.md "5.3 QuickInput 위젯" 참조.
onFabPress → AddEntryModal 오픈.
Haptic feedback 포함.
index.ts Public API 필수.
```

### RecentEntries 데이터 연동
```
너는 Money-Space 개발자야.
src/widgets/recent-entries/RecentEntries.tsx 리팩토링해줘.

현재: 애니메이션만 있고 데이터 없음.
@/entities/entry 에서 useEntries hook으로 데이터 페칭.
onEntryPress → /details/[id] 이동.
swipe → 수정/삭제.
docs/prd/entry/README.md "5.2 EntryItem" 참조.
```

---

## 📱 화면 완성

### HomeScreen
```
너는 Money-Space 개발자야.
app/(tabs)/home.tsx 완성해줘.

포함: MonthlySummary, RecentEntries, QuickInput(FAB), SyncStatus.
TanStack Query: @/entities/entry useEntries.
Expo Router 사용.
Pull-to-refresh.
docs/prd/index.md "Home" 체크리스트 참조.
```

### CalendarScreen
```
너는 Money-Space 개발자야.
app/(tabs)/calendar.tsx 달력 화면 구현해줘.

월별 달력 + 일별 내역 표시.
react-native-calendars 또는 커스텀.
@/entities/entry useEntries로 데이터.
docs/prd/index.md "Calendar" 체크리스트 참조.
```

### StatisticsScreen
```
너는 Money-Space 개발자야.
app/(tabs)/statistics.tsx 통계 화면 구현해줘.

카테고리별 Pie Chart.
월별 Bar Chart.
@/entities/entry useEntries.
docs/prd/budget/README.md BudgetProgress 위젯 활용.
```

---

## 🔌 API 구현

### Entry API 완성
```
너는 Money-Space 개발자야.
src/entities/entry/api/index.ts 완성해줘.

docs/prd/entry/README.md "3. API 인터페이스" 참조.
ENTRY_KEYS (Key Factory) 포함.
createEntryApi (Factory) + useCreateEntry (Hook).
SQLite 우선 저장 → 동기화 큐.
@/shared/api/supabase.ts supabase client 사용.
```

### Budget API
```
너는 Money-Space 개발자야.
src/entities/budget/api/index.ts 구현해줘.

docs/prd/budget/README.md "3. API 인터페이스" 참조.
BUDGET_KEYS (Key Factory).
createBudgetApi + useBudgets + useBudgetProgress.
월별 예산 CRUD.
```

---

## 🐛 버그 수정

### SyncStatus SQLite 오류
```
너는 Money-Space 개발자야.
src/widgets/sync-status/SyncStatus.tsx 버그 수정해줘.

문제: getDb().getAllSync 메서드 불명확.
해결: SQLite pending_changes 테이블에서 count 조회.
0개면 null (아무것도 표시 안 함).
docs/prd/sync/README.md "5.2" 참조.
```

---

## ⚡ 빠른 요청

| 작업 | 프롬프트 |
|------|---------|
| AuthForm 완성 | `너는 개발자야. LoginForm+RegisterForm 완성해줘. docs/prd/auth.` |
| BudgetManager | `너는 개발자야. BudgetManager Modal 구현해줘. docs/prd/budget.` |
| CategoryPicker | `너는 개발자야. CategoryPicker 그리드 구현해줘. docs/prd/category.` |
| FamilyInvite | `너는 개발자야. 가족 초대 기능 구현해줘. docs/prd/family.` |
| SettingsScreen | `너는 개발자야. SettingsScreen 완성해줘. docs/prd/user.` |

---

## 📋 항상 포함해야 할 것

```
1. 역할: "너는 Money-Space 개발자야"
2. 작업: "구현해줘 / 완성해줘 / 수정해줘"
3. 참조: "docs/prd/[도메인]/README.md 참조"
4. 제약: "FSD / TanStack Query / nativewind"
5. 출력: "완성 후 테스트 방법 알려줘"
```

**복사해서 쓰기 쉽게 짧게 유지하세요.**