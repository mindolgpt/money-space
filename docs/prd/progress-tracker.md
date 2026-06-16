# Money-Space 개발 진행률 추적

> 마지막 업데이트: 2026-06-16
> 추적 방식: ✅ 완료 | 🔄 진행중 | ⏳ 미시작 | ❌ 차단

---

## 1. Auth (인증)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **LoginScreen** | 🔄 | - | `app/auth/login.tsx` - LoginForm 호출 |
| **RegisterScreen** | 🔄 | - | `app/auth/register.tsx` |
| **LoginForm** | 🔄 | - | `features/auth/auth-manager/ui/LoginForm.tsx` |
| **RegisterForm** | ⏳ | - | `features/auth/auth-manager/ui/RegisterForm.tsx` |
| **PasswordResetScreen** | ⏳ | - | |
| **AuthStore (Zustand)** | ⏳ | - | `features/auth/auth-manager/model/use-auth-store.ts` |
| **Session Management** | ⏳ | - | SecureStore 연동 |
| **Biometric Auth** | ⏳ | - | 생체 인증 |

### 체크리스트
- [ ] 이메일/비밀번호 입력 필드
- [ ] 로그인 Validation (이메일 형식, 비밀번호 필수)
- [ ] 소셜 로그인 (Google, Apple)
- [ ] 회원가입 Validation (비밀번호 강도, 약관 동의)
- [ ] 비밀번호 재설정 이메일 발송
- [ ] 세션 만료 처리
- [ ] 자동 로그인 (SecureStore 토큰)
- [ ] 로그아웃 처리
- [ ] 로딩/에러 상태 처리

---

## 2. Home (메인 화면)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **HomeScreen** | 🔄 | - | `app/(tabs)/index.tsx` |
| **RecentEntries 위젯** | 🔄 | - | `widgets/recent-entries/` - 애니메이션のみ |
| **MonthlySummary 위젯** | ⏳ | - | `widgets/monthly-summary/` |
| **QuickInput 위젯** | ⏳ | - | `widgets/quick-input/` |
| **SyncStatus 위젯** | 🔄 | - | `widgets/sync-status/` - 기본 구현のみ |
| **FAB (Floating Action Button)** | ⏳ | - | AddEntry 트리거 |

### 체크리스트
- [ ] 월별 요약 카드 (수입/지출/저축)
- [ ] 최근 내역 목록 (FlatList + 애니메이션)
- [ ] 내역 항목 탭 → Details 이동
- [ ] 내역 항목 스와이프 (수정/삭제)
- [ ] QuickInput (금액 바로 입력)
- [ ] 동기화 상태 표시
- [ ] Pull-to-refresh
- [ ] 빈 상태 UI
- [ ] 오프라인 배너

---

## 3. Entry (수입/지출 기록)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **AddEntryModal** | 🔄 | - | `features/entry/add-entry/` |
| **EditEntryModal** | ⏳ | - | `features/entry/edit-entry/` |
| **SearchEntries** | ⏳ | - | `features/entry/search-entries/` |
| **EntryEntity API** | 🔄 | - | `entities/entry/api/index.ts` |
| **Entry Types** | ✅ | - | `entities/entry/model/types.ts` |

### AddEntry 체크리스트
- [ ] EntryType 토글 (수입/지출/저축)
- [ ] 금액 입력 (NumberPad 또는 텍스트)
- [ ] 카테고리 선택 그리드
- [ ] 날짜 선택 (DatePicker)
- [ ] 결제 수단 선택
- [ ] 메모 입력 (500자 제한)
- [ ] 사진 추가 (ImagePicker)
- [ ] 가족 공유 토글
- [ ] 반복 설정
- [ ] Validation (금액 필수, 카테고리 필수)
- [ ] Optimistic Update
- [ ] 로컬 SQLite 저장
- [ ] 동기화 큐 추가

### EditEntry 체크리스트
- [ ] 기존 데이터 로드
- [ ] 폼 초기화
- [ ] 변경사항 감지
- [ ] 저장 시 로컬 + 원격 업데이트
- [ ] 삭제 기능

### SearchEntries 체크리스트
- [ ] 검색어 입력 (디바운스 300ms)
- [ ] 필터 (날짜 범위, 카테고리)
- [ ] 결과 목록
- [ ] 결과 없음 상태
- [ ] 검색어 하이라이트

---

## 4. Calendar (달력)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **CalendarScreen** | 🔄 | - | `app/(tabs)/calendar.tsx` |
| **달력 UI** | ⏳ | - | 월별 달력 그리기 |
| **일별 내역 표시** | ⏳ | - | 선택한 날짜의 내역 |
| **日历 범위 선택** | ⏳ | - | 기간 설정 |

### 체크리스트
- [ ] 월별 달력 표시
- [ ] 수입/지출 금액 표시 (일별 합계)
- [ ] 날짜 탭 → 해당 날짜 내역
- [ ] 월 이동 (이전/다음)
- [ ] 오늘로 이동 버튼
- [ ] 주간/월간 토글

---

## 5. Statistics (통계)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **StatisticsScreen** | 🔄 | - | `app/(tabs)/statistics.tsx` |
| **CategoryChart 위젯** | 🔄 | - | `widgets/category-chart/` |
| **BudgetProgress 위젯** | 🔄 | - | `widgets/budget-progress/` |
| **월별 통계** | ⏳ | - | |
| **카테고리별 분석** | ⏳ | - | |
| **추세선/비교** | ⏳ | - | |

### 체크리스트
- [ ] 월별 수입/지출 총계
- [ ] 카테고리별 Pie Chart
- [ ] 월별 Bar Chart 비교
- [ ] 예산 대비 지출 progress
- [ ] 기간 선택 (주/월/연도)
- [ ] 내보내기 (CSV/PDF)

---

## 6. Details (상세 내역)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **DetailsScreen** | 🔄 | - | `app/details.tsx` |
| **Entry 상세 표시** | ⏳ | - | |
| **사진 갤러리** | ⏳ | - | |
| **지도 연동** | ⏳ | - | 위치 기반 가게 표시 |

### 체크리스트
- [ ] Entry 정보 표시 (금액, 카테고리, 날짜, 메모)
- [ ] 사진 있을 경우 표시
- [ ] 수정 버튼 → EditEntryModal
- [ ] 삭제 버튼 → 확인 다이얼로그
- [ ] 공유 버튼
- [ ] 사진 탭 → 전체 화면

---

## 7. Budget (예산)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **BudgetManager** | ⏳ | - | `features/budget/budget-manager/` |
| **BudgetEntity API** | ⏳ | - | `entities/budget/api/index.ts` |
| **Budget Types** | ✅ | - | `entities/budget/model/types.ts` |
| **BudgetProgress 위젯** | 🔄 | - | 기본 UI만 구현 |

### 체크리스트
- [ ] 월별 예산 설정 화면
- [ ] 카테고리별 예산 금액 입력
- [ ] 예산 저장 (UPSERT)
- [ ] 진행률 실시간 계산
- [ ] 100% 초과 경고 (색상 변경, 애니메이션)
- [ ] 예산 삭제
- [ ] 알림 설정 연동

---

## 8. Category (카테고리)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **CategoryManager** | ⏳ | - | 미구현 |
| **CategoryEntity API** | ⏳ | - | `entities/category/api/index.ts` |
| **Category Types** | ✅ | - | `entities/category/model/types.ts` |
| **CategoryPicker** | ⏳ | - | AddEntryModal에서 사용 |

### CategoryManager 체크리스트
- [ ] 카테고리 목록 (타입별 탭)
- [ ] 시스템 카테고리 표시 (편집 불가)
- [ ] 사용자 정의 카테고리 추가
- [ ] 카테고리명/아이콘 편집
- [ ] 드래그 순서 변경
- [ ] 카테고리 삭제 (사용중 체크)

### CategoryPicker 체크리스트
- [ ] 아이콘 그리드
- [ ] 검색 필터
- [ ] 선택 상태 표시
- [ ] 롱프레스 → 편집/삭제

---

## 9. Family (가족)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **FamilyListScreen** | ⏳ | - | |
| **CreateFamilyModal** | ⏳ | - | |
| **InviteFamilyModal** | ⏳ | - | |
| **JoinFamilyModal** | ⏳ | - | |
| **FamilyMemberList** | ⏳ | - | |
| **FamilyInviteFeature** | 🔄 | - | `features/family/family-invite/` |
| **FamilyEntity API** | ⏳ | - | `entities/family/api/index.ts` |
| **Family Types** | ✅ | - | `entities/family/model/types.ts` |

### 체크리스트
- [ ] 가족 목록 조회
- [ ] 가족 생성 (이름 입력)
- [ ] 초대 코드 생성 (6자리)
- [ ] 초대 코드 복사/공유
- [ ] 초대 코드 입력 → 참여
- [ ] 멤버 역할 관리 (admin/member/viewer)
- [ ] 멤버 추방 (admin만)
- [ ] 가족 탈퇴
- [ ] 가족 모드 전환
- [ ] 공유 가계 조회

---

## 10. Settings (설정)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **SettingsScreen** | 🔄 | - | `app/(tabs)/settings.tsx` |
| **ProfileSettings** | ⏳ | - | 이름, 아바타 변경 |
| **NotificationSettings** | ⏳ | - | 알림 On/Off |
| **ThemeSettings** | ⏳ | - | 라이트/다크/시스템 |
| **DataExport** | ⏳ | - | CSV/JSON 내보내기 |
| **DataImport** | ⏳ | - | CSV/JSON 가져오기 |
| **DeleteAccount** | ⏳ | - | 계정 삭제 |

### 체크리스트
- [ ] 프로필 편집 (이름, 아바타)
- [ ] 아바타 변경 (카메라/앨범)
- [ ] 알림 설정 (예산 경고, 주간 요약 등)
- [ ] 테마 선택
- [ ] 데이터 내보내기
- [ ] 데이터 가져오기 (필드 매핑)
- [ ] 계정 삭제 (비밀번호 확인)
- [ ] 로그아웃
- [ ] 앱 버전 표시

---

## 11. Sync (동기화)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **SyncEngine** | ⏳ | - | `features/sync/sync-engine/` |
| **SyncQueueEntity** | ⏳ | - | `entities/sync-queue/` |
| **SyncStatus 위젯** | 🔄 | - | 기본 표시만 |
| **ConflictResolution** | ⏳ | - | 충돌 해결 로직 |

### 체크리스트
- [ ] SQLite 기본 CRUD
- [ ] Supabase 연동
- [ ] 오프라인 큐 관리
- [ ] 앱 포그라운드 시 자동 동기화
- [ ] 네트워크 상태 감시
- [ ] 충돌 감지 (updatedAt 비교)
- [ ] 충돌 해결 (로컬/원격/머지)
- [ ] 실패 항목 재시도
- [ ] Wi-Fi Only 옵션
- [ ] 수동 동기화 버튼

---

## 12. Onboarding

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **OnboardingScreen** | ⏳ | - | |
| **PermissionRequest** | ⏳ | - | 알림, 카메라 등 |

### 체크리스트
- [ ] 앱 소개 슬라이드
- [ ] 핵심 기능 설명
- [ ] 권한 요청 (알림)
- [ ] 초기 카테고리 선택
- [ ] 첫 예산 설정

---

## 13. Deep Links & Notifications

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **FamilyInvite Deep Link** | 🔄 | - | `app/invite/` |
| **Push Notifications** | ⏳ | - | |
| **Local Notifications** | ⏳ | - | 예산 경고 등 |

### 체크리스트
- [ ] keluarga 초대 deep link 처리
- [ ] Push 알림 수신
- [ ]-budget 경고 알림
- [ ] 반복 항목 리마인더

---

## 14. Infrastructure (인프라)

| 기능 | 상태 | 담당 | 비고 |
|------|------|------|------|
| **Supabase Client** | 🔄 | - | `shared/api/supabase.ts` |
| **SQLite Setup** | 🔄 | - | `shared/lib/index.ts` |
| **TanStack Query Setup** | 🔄 | - | |
| **Navigation** | 🔄 | - | Expo Router |
| **ErrorBoundary** | ⏳ | - | |
| **Logging** | ⏳ | - | |

### 체크리스트
- [ ] Supabase 환경설정
- [ ] SQLite 마이그레이션
- [ ] QueryClient 설정
- [ ] Navigation 구조
- [ ] 인증 가드
- [ ] 에러 바운더리
- [ ] 디버그 로깅

---

## 진행률 요약

| 도메인 | 완료 | 진행중 | 미시작 | 진행률 |
|--------|------|--------|--------|--------|
| Auth | 0 | 4 | 4 | 0% |
| Home | 1 | 4 | 3 | 12% |
| Entry | 2 | 1 | 7 | 20% |
| Calendar | 0 | 1 | 4 | 0% |
| Statistics | 0 | 2 | 4 | 0% |
| Details | 0 | 1 | 5 | 0% |
| Budget | 1 | 0 | 5 | 17% |
| Category | 1 | 0 | 5 | 17% |
| Family | 1 | 1 | 7 | 11% |
| Settings | 0 | 1 | 7 | 0% |
| Sync | 0 | 2 | 7 | 0% |
| Onboarding | 0 | 0 | 4 | 0% |
| Infra | 0 | 4 | 3 | 0% |

**전체 진행률: ~8%**

---

## 업데이트 로그

| 날짜 | 도메인 | 변경 내용 | 담당 |
|------|--------|----------|------|
| 2026-06-16 | 초기 | 문서 생성 | - |