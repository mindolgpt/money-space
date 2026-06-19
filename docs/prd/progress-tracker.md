# Money-Space 개발 진행률 추적

> 마지막 업데이트: 2026-06-17
> 추적 방식: ✅ 완료 | 🔄 진행중 | ⏳ 미시작 | ❌ 차단

---

## 1. Auth (인증)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **LoginScreen** | ✅ | - | `app/auth/login.tsx` → `LoginForm` |
| **RegisterScreen** | ✅ | - | `app/auth/register.tsx` → `RegisterForm` |
| **LoginForm** | ✅ | - | `features/auth/auth-manager/ui/LoginForm.tsx` - 유효성 검증/비밀번호 토글/에러처리 완료 |
| **RegisterForm** | ✅ | - | `features/auth/auth-manager/ui/RegisterForm.tsx` - 비밀번호 강도/약관/확인 완료 |
| **PasswordResetScreen** | ✅ | - | `app/auth/reset-password.tsx` → `PasswordResetForm` |
| **AuthStore (Zustand)** | ✅ | - | `features/auth/auth-manager/model/use-auth-store.ts` - isAuthenticated/isSigningOut/auth listener |
| **Session Management** | ✅ | - | SecureStore 연동 (토큰 저장/복원/삭제) |
| **Biometric Auth** | ✅ | - | 생체 인증 구현 — expo-local-authentication 연동, AuthStore biometric actions, Settings 보안 섹션, 앱 실행 시 생체 인증 프롬프트 |

### 체크리스트
- [x] 이메일/비밀번호 입력 필드
- [x] 로그인 Validation (이메일 형식, 비밀번호 필수, 필드별 에러)
- [ ] 소셜 로그인 (Google, Apple) — LoginForm에 UI 버튼 추가 (준비 중 disabled)
- [x] 회원가입 Validation (비밀번호 강도 체크, 약관 동의, 확인 비밀번호)
- [x] 비밀번호 재설정 이메일 발송
- [x] 세션 만료 처리 — SIGNED_OUT 이벤트 감지 → 자동 로그아웃 + 로깅
- [x] 자동 로그인 (SecureStore 토큰)
- [x] 로그아웃 처리
- [x] 로딩/에러 상태 처리 (필드별 에러, 로딩 스피너, 에러 메시지 매핑)
- [x] 생체 인증 (expo-local-authentication) — 앱 실행 시 생체 인증 프롬프트, Settings 보안 섹션 토글

---

## 2. Home (메인 화면)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **HomeScreen** | ✅ | - | `app/(tabs)/index.tsx` → `pages/home/ui/HomeScreen.tsx` |
| **RecentEntries 위젯** | ✅ | - | `widgets/recent-entries/` - 스와이프/탭/삭제 구현 |
| **MonthlySummary 위젯** | ✅ | - | `widgets/monthly-summary/` - 저축 추가 |
| **QuickInput 위젯** | ✅ | - | `widgets/quick-input/` |
| **SyncStatus 위젯** | ✅ | - | `widgets/sync-status/` |
| **FAB (Floating Action Button)** | ✅ | - | AddEntry 트리거 |

### 체크리스트
- [x] 월별 요약 카드 (수입/지출/저축)
- [x] 최근 내역 목록 (FlatList + 재조정 애니메이션)
- [x] 내역 항목 탭 → Details 이동
- [x] 내역 항목 스와이프 (수정/삭제)
- [x] QuickInput (금액 바로 입력)
- [x] 동기화 상태 표시
- [x] Pull-to-refresh
- [x] 빈 상태 UI
- [x] 오프라인 배너

---

## 3. Entry (수입/지출 기록)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **AddEntryModal** | ✅ | - | `features/entry/add-entry/` — EntryForm + AddEntryModal, 타입 토글, 금액 포맷, DatePicker, CategoryPicker, PaymentMethodSelector, 메모 500자, isShared/isRecurring 토글, Validation, Optimistic Update |
| **EditEntryModal** | ✅ | - | `features/entry/edit-entry/` — pre-filled form, update/delete, onSuccess callback |
| **SearchEntries** | ✅ | - | `features/entry/search-entries/` — 300ms debounce, type filter, result count, empty state |
| **EntryDetailsScreen** | ✅ | - | `pages/details/` — 금액hero, type badges, detail rows, edit/delete/share buttons |
| **EntryEntity API** | ✅ | - | `entities/entry/api/` — useSearchEntries, useCreateEntry (optimistic), useUpdateEntry, useDeleteEntry, ENTRY_KEYS.search |
| **Entry Types** | ✅ | - | `entities/entry/model/types.ts` |

### AddEntry 체크리스트
- [x] EntryType 토글 (수입/지출/저축)
- [x] 금액 입력 (TextInput + 포맷터)
- [x] 카테고리 선택 그리드 (horizontal FlatList)
- [x] 날짜 선택 (DatePicker — wheel style modal)
- [x] 결제 수단 선택 (PaymentMethodSelector — 4종 chip)
- [x] 메모 입력 (500자 제한, char counter)
- [x] 사진 추가 (ImagePicker) — expo-image-picker 설치, PhotoPicker 컴포넌트, 카메라/라이브러리 선택, 최대 5장, 삭제 확인 다이얼로그
- [x] 가족 공유 토글 (Switch)
- [x] 반복 설정 (Switch)
- [x] Validation (금액 필수, 카테고리 필수, 미래 날짜 확인)
- [x] Optimistic Update (useCreateEntry의 onMutate)
- [x] 로컬 SQLite 저장 (createEntryLocally → insertEntry)
- [x] 동기화 큐 추가 (createEntryLocally → enqueue)

### EditEntry 체크리스트
- [x] 기존 데이터 로드 (useEntry hook)
- [x] 폼 초기화 (useEffect로 entry → form state)
- [x] 변경사항 감지 (hasChanges state)
- [x] 저장 시 로컬 + 원격 업데이트 (modifyEntryLocally → updateEntry → sync queue)
- [x] 삭제 기능 (ConfirmDialog → removeEntryLocally)

### SearchEntries 체크리스트
- [x] 검색어 입력 (useDebounce 300ms)
- [x] 필터 (type: 전체/지출/수입/저축)
- [x] 결과 목록 (FlatList)
- [x] 결과 없음 상태 (empty component with icon)
- [x] 검색어 하이라이트 — HighlightedText 컴포넌트, 메모/금액 매칭 부분 강조 표시

---

## 4. Calendar (달력)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **CalendarScreen** | ✅ | - | `pages/calendar/ui/CalendarScreen.tsx` — 월별 달력 그리드, 월별 합계 요약, 월 이동, 일별 수입/지출 구분 표시, 내역 탭 → 상세 이동 |
| **달력 UI** | ✅ | - | 월별 달력 그리기 (주간 헤더, 일별 정사각형 셀, 오늘/선택 highlight, 수입·지출 점 표시) |
| **일별 내역 표시** | ✅ | - | 선택 날짜의 수입/지출 금액 표시 + 카테고리별 내역 나열 + tap → 상세 이동 |
| **월 이동** | ✅ | - | ◀ ▶ 버튼으로 월 변경, 월별 합계 실시간 갱신 |

### 체크리스트
- [x] 월별 달력 표시
- [x] 수입/지출 금액 표시 (일별 합계)
- [x] 날짜 탭 → 해당 날짜 내역
- [x] 월 이동 (이전/다음)
- [x] 오늘로 이동 버튼
- [x] 주간/월간 토글

---

## 5. Statistics (통계)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **StatisticsScreen** | ✅ | - | `pages/statistics/ui/StatisticsScreen.tsx` — PeriodSelector, PieChart, BudgetVsActual, MonthlyComparison, CSV/PDF Export |
| **CategoryChart 위젯** | ✅ | - | `widgets/category-chart/` — 카테고리별 막대 그래프 (Animated) |
| **PieChart 위젯** | ✅ | - | `widgets/pie-chart/` — 카테고리별 Pie Chart |
| **PeriodSelector 위젯** | ✅ | - | `widgets/period-selector/` — 주/월/연도 선택 |
| **BudgetVsActual 위젯** | ✅ | - | `widgets/budget-vs-actual/` — 예산 대비 지출 progress |
| **MonthlyComparisonChart** | ✅ | - | `widgets/monthly-comparison/` — 월별 Bar Chart 비교 (6개월) |
| **export-helper** | ✅ | - | `shared/lib/export-helper.ts` — CSV/PDF 내보내기 |
| **월별 통계** | ✅ | - | 월 이동 (prev/next), 월별 합계, 절감률, 일 평균 |

### 체크리스트
- [x] 월별 수입/지출 총계
- [x] 카테고리별 Pie Chart
- [x] 월별 Bar Chart 비교
- [x] 예산 대비 지출 progress
- [x] 기간 선택 (주/월/연도)
- [x] 내보내기 (CSV/PDF)

---

## 6. Details (상세 내역)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **DetailsScreen** | ✅ | - | `pages/details/ui/DetailScreen.tsx` — 금액 hero, type/share/recurring 배지, 카테고리 실제 이름, 메모, 공유/수정/삭제, 사진 GalleryModal |
| **Entry 상세 표시** | ✅ | - | 금액 hero + type badge, 카테고리명(실제 이름), 결제수단, 메모, 생성/수정일 |
| **사진 갤러리** | ✅ | - | ScrollView horizontal, tap → Modal 전체 화면, React Native Image |
| **지도 연동** | ✅ | - | 위치 기반 가게 표시 |

### 체크리스트
- [x] Entry 정보 표시 (금액, 카테고리, 날짜, 메모)
- [x] 사진 있을 경우 표시
- [x] 수정 버튼 → EditEntryModal
- [x] 삭제 버튼 → 확인 다이얼로그
- [x] 공유 버튼
- [x] 사진 탭 → 전체 화면

---

## 7. Budget (예산)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **BudgetManager** | ✅ | - | `features/budget/budget-manager/ui/BudgetManager.tsx` — 월별 설정, 카테고리별 입력, 실시간 progress, 저장/초기화 |
| **BudgetEntity API** | ✅ | - | `entities/budget/api/index.ts` — BUDGET_KEYS, createBudgetApi, useBudgets/useBudgetProgress/useCreateBudget/useUpdateBudget/useDeleteBudget |
| **Budget Types** | ✅ | - | `entities/budget/model/types.ts` — Budget, CreateBudgetInput, UpdateBudgetInput, BudgetProgress |
| **BudgetProgress 위젯** | ✅ | - | `widgets/budget-progress/BudgetProgress.tsx` — pulse 애니메이션, onPress 콜백 |
| **BudgetCard** | ✅ | - | `widgets/budget-progress/BudgetCard.tsx` — 스와이프/삭제 |

### 체크리스트
- [x] 월별 예산 설정 화면
- [x] 카테고리별 예산 금액 입력
- [x] 예산 저장 (UPSERT)
- [x] 진행률 실시간 계산
- [x] 100% 초과 경고 (색상 변경, 애니메이션)
- [x] 예산 삭제
- [x] 알림 설정 연동 (budgetAlert 설정 확인, 80%/100% 초과 시 Alert)

---

## 8. Category (카테고리)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **CategoryManager** | ✅ | - | `features/category/category-manager/` — 타입별 탭, 카테고리 목록, 추가/편집/삭제 |
| **CategoryEntity API** | ✅ | - | `entities/category/api/index.ts` — CATEGORY_KEYS, createCategoryApi, useCategories/useCreateCategory/useUpdateCategory/useDeleteCategory/useReorderCategories |
| **Category Types** | ✅ | - | `entities/category/model/types.ts` — Category, CategoryType, Create/UpdateCategoryInput |
| **CategoryPicker** | ✅ | - | `features/category/category-picker/` — 그리드형, 검색 필터, 롱프레스 컨텍스트 메뉴 |
| **CategoryCreateModal** | ✅ | - | `features/category/category-modal/` — 아이콘 선택, 이름 입력 (20자 제한), 저장 |
| **CategoryEditModal** | ✅ | - | `features/category/category-modal/` — 미리보기, 아이콘 변경, 이름 변경 |
| **CategoryManagerScreen** | ✅ | - | `pages/category/` — Settings → 카테고리 관리 routes |
| **Supabase Schema** | ✅ | - | `docs/prd/supabase-schema.sql` — categories table + RLS policies |
| **SQLite Migration** | ✅ | - | `src/shared/lib/db.ts` — is_system column 추가, seed 데이터 is_system=1 |

### CategoryManager 체크리스트
- [x] 카테고리 목록 (타입별 탭 — 수입/지출/저축)
- [x] 시스템 카테고리 표시 (편집 불가, "시스템 카테고리" 라벨)
- [x] 사용자 정의 카테고리 추가 (아이콘 선택 + 이름 입력)
- [x] 카테고리명/아이콘 편집 (미리보기 표시)
- [x] 드래그 순서 변경 — 순서 편집 모드 (▲▼ 버튼), useReorderCategories 연동
- [x] 카테고리 삭제 (확인 다이얼로그, 시스템 카테고리는 삭제 불가)

### CategoryPicker 체크리스트
- [x] 아이콘 그리드 (flex-wrap, 각 아이템 아이콘+이름)
- [x] 검색 필터 (showSearch prop)
- [x] 선택 상태 표시 (isSelected 시 accent-blue 배경 + scale 애니메이션)
- [x] 롱프레스 → 편집/삭제 (allowContextMenu prop, 시스템 카테고리 제외)

---

## 9. Family (가족)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **FamilyManager** | ✅ | - | `features/family/family-manager/` — 가족 목록, 초대/참여, 멤버 관리, 탈퇴 |
| **FamilyMemberList** | ✅ | - | `features/family/family-manager/` — 역할 배지, 추방, 역할 변경 |
| **CreateFamilyModal** | ✅ | - | `features/family/family-modal/` — 이름 입력 → 생성 → 초대 코드 표시 |
| **InviteFamilyModal** | ✅ | - | `features/family/family-modal/` — 코드 보기/복사/공유, 코드 새로 생성 |
| **JoinFamilyModal** | ✅ | - | `features/family/family-modal/` — 6자리 코드 입력, 자동 검증, 참여 |
| **InviteScreen (개선)** | ✅ | - | `features/family/family-invite/` — familyId 없을 때 JoinFamilyModal 표시 |
| **AcceptInvite (개선)** | ✅ | - | `features/family/family-invite/` — 코드 직접 입력 + 검증 |
| **SharedScreen (개선)** | ✅ | - | `pages/shared/` — 실제 hooks 사용, 관리 버튼, 초대 모달 |
| **FamilyManagerScreen** | ✅ | - | `pages/family/` — FamilyManager wrapping |
| **FamilyEntity API** | ✅ | - | `entities/family/api/` — FAMILY_KEYS 확장, 전체 hooks |
| **Family Types** | ✅ | - | `entities/family/model/types` — FamilyRole union, 초대 코드 필드 추가 |
| **Supabase Schema** | ✅ | - | `docs/prd/supabase-schema.sql` — families, family_members, family_invites + RLS |
| **SQLite Migration** | ✅ | - | `src/shared/lib/db.ts` — families.invite_code column 추가 |

### Family 체크리스트
- [x] 가족 목록 조회
- [x] 가족 생성 (이름 입력)
- [x] 초대 코드 생성 (6자리, 24시간 만료)
- [x] 초대 코드 복사/공유 (Share.share)
- [x] 초대 코드 입력 → 참여
- [x] 멤버 역할 관리 (admin/member/viewer)
- [x] 멤버 추방 (admin만)
- [x] 가족 탈퇴 (마지막 관리자 불가)
- [x] SharedScreen에 관리 버튼 연결
- [x] SQLite families.invite_code column migration

### SharedScreen 체크리스트
- [x] 가족 정보 표시 (이름, 멤버 수)
- [x] 관리 버튼 → FamilyManagerScreen 이동
- [x] 필터 탭 (전체/개인/공유)
- [x] 멤버 목록 (TanStack Query hooks)
- [x] 초대 코드 만들기 → InviteFamilyModal
- [x] 공유 거래 표시 — getEntriesByFamilyId SQLite 함수, useFamilyEntries hook, FamilyManager에 공유 거래 섹션 추가 (최대 10개)

---

## 10. User/Settings (사용자/설정)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **SettingsScreen** | ✅ | - | `pages/settings/ui/SettingsScreen.tsx` — 아코디언 섹션 + 로그아웃 ConfirmDialog |
| **ProfileSettings** | ✅ | - | `features/user/profile-settings/` — 이름 편집 저장 |
| **NotificationSettings** | ✅ | - | `features/user/notification-settings/` — 4개 토글, 디바운스 저장 |
| **ThemeSettings** | ✅ | - | SettingsScreen 내장 — 다크모드 토글 |
| **DataExport** | ✅ | - | `features/user/data-export/` — CSV/JSON 내보내기 |
| **DataImport** | ✅ | - | `features/user/data-import/` — CSV/JSON 파일 가져오기 (DocumentPicker 연동) |
| **DeleteAccount** | ✅ | - | `features/user/delete-account/` — 비밀번호 확인 + 최종 ConfirmDialog |

### 체크리스트
- [x] 프로필 편집 (이름)
- [x] 아바타 변경 (ImagePicker) — expo-image-picker 연동, Supabase storage 'avatars' 버킷에 업로드
- [x] 알림 설정 (예산 경고, 주간 요약 등)
- [x] 테마 선택 (라이트/다크)
- [x] 데이터 내보내기 (CSV/JSON)
- [x] 데이터 가져오기 (DocumentPicker) — CSV/JSON 파싱, createEntryLocally로 entries 가져오기
- [x] 계정 삭제 (비밀번호 확인)
- [x] 로그아웃 (ConfirmDialog)
- [x] 앱 버전 표시

---

## 11. Sync (동기화)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **SyncEngine** | ✅ | - | `features/sync/sync-engine/` — pushPendingChanges, conflict-resolution, network-status |
| **SyncQueueEntity** | ✅ | - | `entities/sync-queue/` — types, api, hooks (useSyncStatus, useManualSync 등) |
| **SyncStatus 위젯** | ✅ | - | `widgets/sync-status/` — reactive, 오프라인/동기화중/완료 상태 |
| **ConflictResolution** | ✅ | - | `features/sync/sync-engine/model/conflict-resolution.ts` |

### 체크리스트
- [x] SQLite 기본 CRUD
- [x] Supabase 연동
- [x] 오프라인 큐 관리
- [x] 앱 포그라운드 시 자동 동기화
- [x] 네트워크 상태 감시 (NetworkMonitor + setNetworkStatus)
- [x] 충돌 감지 (updatedAt 비교)
- [x] 충돌 해결 (로컬/원격/머지)
- [x] 실패 항목 재시도 (SYNC_RETRY_MAX)
- [x] Wi-Fi Only 옵션 — expo-network 설치, isWifi() 함수, pushPendingChanges에서 wifiOnly 설정 체크
- [x] 수동 동기화 버튼 (SyncStatus 위젯 내)

---

## 12. Onboarding

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **OnboardingScreen** | ✅ | - | `app/onboarding/index.tsx` — 슬라이드, 권한 요청, 예산/카테고리 선택 |
| **PermissionRequest** | ✅ | - | 알림 권한 요청 (expo-notifications 연동 준비) |

### 체크리스트
- [x] 앱 소개 슬라이드 (4페이지)
- [x] 핵심 기능 설명
- [x] 권한 요청 (알림)
- [x] 초기 카테고리 선택
- [x] 첫 예산 설정

---

## 13. Deep Links & Notifications

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **FamilyInvite Deep Link** | ✅ | - | `app/invite/[code].tsx` + `app.json linking` |
| **Push Notifications** | ✅ | - | `shared/lib/notifications.ts` + Providers |
| **Local Notifications** | ✅ | - | `shared/lib/notifications.ts` — budget/recurring/weekly/monthly |
| **Notification Settings** | ✅ | - | NotificationSettings 토글 연동 |

### 체크리스트
- [x] keluarga 초대 deep link 처리
- [x] Push 알림 수신 (expo-notifications)
- [x] Budget 경고 알림 (80%/100% 초과 시 Alert)
- [x] 반복 항목 리마인더 (scheduleLocalNotification)

---

## 14. Infrastructure (인프라)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **Supabase Client** | ✅ | - | `shared/api/supabase.ts` |
| **SQLite Setup** | ✅ | - | `shared/lib/db.ts` |
| **TanStack Query Setup** | ✅ | - | `providers.tsx` |
| **Navigation** | ✅ | - | Expo Router |
| **ErrorBoundary** | ✅ | - | `shared/ui/ErrorBoundary.tsx` |
| **Logging** | ✅ | - | `shared/lib/logger.ts` |

### 체크리스트
- [x] Supabase 환경설정
- [x] SQLite 마이그레이션
- [x] QueryClient 설정
- [x] Navigation 구조
- [x] 인증 가드 (AuthRouter in providers.tsx)
- [x] 에러 바운더리
- [x] 디버그 로깅

---

## 진행률 요약

| 도메인 | 완료 | 진행중 | 미시작 | 진행률 |
|--------|------|--------|--------|--------|
| Auth | 8 | 0 | 1 | 89% |
| Home | 6 | 0 | 0 | 100% |
| Entry | 6 | 0 | 0 | 100% |
| Calendar | 4 | 0 | 0 | 100% |
| Statistics | 8 | 0 | 0 | 100% |
| Details | 4 | 0 | 0 | 100% |
| Budget | 5 | 0 | 0 | 100% |
| Category | 9 | 0 | 0 | 100% |
| Family | 12 | 0 | 0 | 100% |
| Settings | 7 | 0 | 0 | 100% |
| Sync | 4 | 0 | 0 | 100% |
| Onboarding | 2 | 0 | 0 | 100% |
| Deep Links | 4 | 0 | 0 | 100% |
| Infra | 6 | 0 | 0 | 100% |

**전체 진행률: ~99%**

---

## 업데이트 로그

| 날짜 | 도메인 | 변경 내용 | 담당 |
|------|--------|----------|------|
| 2026-06-16 | 초기 | 문서 생성 | - |
| 2026-06-16 | Home | Home 도메인 전체 구현 완료: PRD 문서, HomeScreen 종합 업데이트, RecentEntries 스와이프/탭/삭제, MonthlySummary 저축 추가, QuickInput 위젯 신규, 오프라인 배너, Pull-to-refresh, 빈 상태 UI | AI |
| 2026-06-16 | Auth | Auth 도메인 전체 구현 완료: LoginForm/RegisterForm 유효성 검증/에러처리, PasswordResetForm 신규, AuthStore 개선 (isAuthenticated/isSigningOut/auth listener), AUTH_KEYS + TanStack Query hooks, onAuthStateChange | AI |
| 2026-06-16 | User | User 도메인 전체 구현 완료: UserProfile/UserSettings 타입, shared/api/user (supabase+sqlite), USER_KEYS + TanStack Query hooks, ProfileSettings, NotificationSettings, DataExport, DataImport, DeleteAccount, SettingsScreen 아코디언 리팩터, user_settings SQLite 테이블 추가, 앱 버전 표시 | AI |
| 2026-06-16 | Sync | Sync 도메인 전체 구현 완료: SyncQueue 타입 확장 (SyncState/SyncProgress/SyncConflict), shared/api/sync-queue (getFailedChanges/resetToPending/removeFromQueue 등), SYNC_KEYS + TanStack Query hooks (useSyncStatus/useManualSync 등), pushPendingChanges 리팩터 (충돌 감지+해결, 재시도 로직), conflict-resolution, network-status, SyncStatus 위젯 reactive 개선, providers NetworkMonitor 추가 | AI |
| 2026-06-17 | Entry | Entry 도메인 구현 완료: shared/api/entry/sqlite deep import 수정 + userId 파라미터 추가, ENTRY_KEYS.search + useSearchEntries/useCreateEntry(optimistic)/useUpdateEntry/useDeleteEntry hooks, EntryForm (AddEntryModal) 전면 재작성 — 금액포맷, DatePicker, validation(금액/카테고리/미래날짜), optimistic update, unsaved changes 확인, isShared/isRecurring 토글, 메모 500자제한, useCreateEntry onMutate로 낙관적 업데이트, EditEntryModal — pre-filled form, update/delete, SearchSheet — 300ms debounce, type filter, result count, empty state, EntryDetailsScreen — amount hero, type badges, detail rows, edit/delete/share buttons | AI |
| 2026-06-16 | Category | Category 도메인 전체 구현 완료: Category 타입 확장 (isSystem/order/userId), Create/UpdateCategoryInput, shared/api/category supabase+sqlite (전체 CRUD + reorder), CATEGORY_KEYS + TanStack Query hooks (useCategories/useCreateCategory/useUpdateCategory/useDeleteCategory/useReorderCategories), features/category/category-manager (타입별 탭, 목록, 추가/편집/삭제, 시스템 카테고리 표시), features/category/category-modal (CreateModal/EditModal — 아이콘 선택, 20자 제한, 미리보기), features/category/category-picker (그리드형, 검색 필터, 롱프레스 컨텍스트 메뉴), pages/category/CategoryManagerScreen, SQLite is_system migration + seed data update, supabase-schema.sql (categories table + RLS) | AI |
| 2026-06-17 | Family | Family 도메인 전체 구현 완료: FamilyRole union 타입, FamilyMembers 확장, shared/api/family supabase (create/update/delete/generateInviteCode/joinByCode/validateInviteCode/leave/updateMemberRole/removeMember/listMembers/listUserFamilies), shared/api/family sqlite (invite_code column, updateMemberRole/deleteMember/update), FAMILY_KEYS 확장, useFamilies/useFamilyMembers/useJoinFamily/useLeaveFamily/useUpdateMemberRole/useRemoveMember/useGenerateInviteCode hooks, features/family/family-manager (가족 목록, 초대/참여, 멤버 관리, 탈퇴), features/family/family-modal (CreateFamilyModal/JoinFamilyModal/InviteFamilyModal), features/family/family-invite 개선 (코드 직접 입력), pages/shared/SharedScreen 재작성 (hooks 사용, 관리 버튼), pages/family/FamilyManagerScreen, SQLite families.invite_code migration, supabase-schema.sql (families/family_members/family_invites tables + RLS) | AI |
| 2026-06-17 | Calendar | CalendarScreen 전체 재구현 — 월 이동(prev/next), 월별 수입/지출/저축 요약 카드, 달력 그리드(주차별 색상 구분, 빨강점=지출/초록점=수입), 선택일 내역(수입/지출 금액 + 카테고리별 내역 탭 → 상세 이동), useCategories로 실제 카테고리명 표시 |
| 2026-06-17 | Statistics | StatisticsScreen 전체 재구현 — 월 이동, 월별 수입/지출/저축/절감률 요약, 저축 금액, 일 평균 지출, 상위 카테고리 BAR, CategoryChart 2개(expense/income) |
| 2026-06-17 | Details | DetailScreen 개선 — useCategory로 실제 카테고리명 표시, React Native Image로 사진 렌더링, tap → Modal 전체 화면, paymentLabel 정리, Saving 타입 구분 색상 표시 |
| 2026-06-17 | Misc | Calendar 오늘로 이동 버튼 + 주간/월간 토글 추가, Sync Wi-Fi Only 옵션 연동 (expo-network isWifi), DataImport DocumentPicker 연동 (CSV/JSON 파싱), Settings 아바타 변경 ImagePicker 연동 (Supabase storage 업로드), Family 공유 거래 표시 (getEntriesByFamilyId SQLite 함수, useFamilyEntries hook, FamilyManager에 공유 거래 섹션) | AI |
| 2026-06-17 | Misc | Biometric Auth (expo-local-authentication, AuthStore, Settings 보안 섹션 토글, providers.tsx 생체 인증 프롬프트), SearchEntries 검색어 하이라이트 (HighlightedText 컴포넌트), Category 드래그 순서 변경 (▲▼ 순서 편집 모드) | AI |
| 2026-06-17 | Misc | LoginForm 소셜 로그인 UI 버튼 추가 (준비 중), 세션 만료 처리 (SIGNED_OUT 로깅), 진행률 요약 테이블 정정 (Statistics/Budget/Onboarding/Infra 100%) | AI |
