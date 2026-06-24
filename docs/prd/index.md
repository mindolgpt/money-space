# Money-Space PRD

## 프로젝트 개요

**프로젝트명:** Money-Space
**유형:** 가계부/자산 관리 모바일 애플리케이션
**기술 스택:** React Native (Expo), TypeScript, FSD 아키텍처
**동기화 방식:** SQLite (로컬) + Supabase (원격) 하이브리드 오프라인 우선

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        App (Expo Router)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Features      │  Widgets                │
│  ───────────    │  ───────────   │  ───────────           │
│  home/          │  auth/         │  quick-input/           │
│  calendar/      │  entry/        │  recent-entries/        │
│  statistics/    │  budget/       │  budget-progress/       │
│  details/       │  family/       │  category-chart/        │
│  settings/      │  sync/         │  monthly-summary/       │
│                 │                │  sync-status/          │
├─────────────────────────────────────────────────────────────┤
│  Entities (도메인 모델 + API 팩토리 + TanStack Query Hooks)   │
│  ─────────────────────────────────────────────────────────  │
│  entry/ │ budget/ │ category/ │ family/ │ user/ │ sync-queue/ │
├─────────────────────────────────────────────────────────────┤
│  Shared                                                         │
│  ─────────────────────────────────────────────────────────   │
│  api/supabase.ts (Base Client)                                │
│  api/[domain]/supabase.ts (도메인별 래퍼)                       │
│  config/, lib/                                                │
└─────────────────────────────────────────────────────────────┘
```

## 데이터 접근 규칙

| 레이어 | supabase 직접 접근 | entity barrel만 접근 |
|--------|-------------------|---------------------|
| Pages | ❌ | ✅ |
| Features | ❌ | ✅ |
| Widgets | ❌ | ✅ |
| Entities | ✅ (api/) | ✅ (index.ts) |
| Shared API | ✅ (supabase.ts) | - |

## 공통 타입

### EntryType
```typescript
type EntryType = 'income' | 'expense' | 'saving'
```

### PaymentMethod
```typescript
type PaymentMethod = 'cash' | 'card' | 'account' | 'transfer'
```

## 도메인 문서 인덱스 (AI 에이전트 가이드)

| 문서 | 경로 | 키워드 |
|------|------|--------|
| Entry | `docs/prd/entry/README.md` | CRUD, 검색, `CreateEntryInput`, `ENTRY_KEYS` |
| Budget | `docs/prd/budget/README.md` | 예산 설정, 진행률, `BUDGET_KEYS` |
| Category | `docs/prd/category/README.md` | 카테고리 CRUD, 아이콘, 순서변경, `CATEGORY_KEYS` |
| Family | `docs/prd/family/README.md` | 가족 초대, 멤버 역할, `FAMILY_KEYS` |
| Auth | `docs/prd/auth/README.md` | 인증, 회원가입, 세션, `AUTH_KEYS` |
| Sync | `docs/prd/sync/README.md` | 오프라인 동기화, 큐, 충돌, `SYNC_KEYS` |
| User | `docs/prd/user/README.md` | 프로필, 설정, 알림, `USER_KEYS` |
| Shared | `docs/prd/shared/README.md` | 공통 UI 이벤트, 컴포넌트 규칙 |
| Home | `docs/prd/home/README.md` | 메인 대시보드, QuickInput, RecentEntries |
| Progress | `docs/prd/progress-tracker.md` | 기능별 완료율 ~99%, 체크리스트 |

---

## 문서 작성 규칙 (AI 에이전트용)

### 각 문서 구성

1. **기능 개요** - 도메인이 담당하는 핵심 기능 설명
2. **데이터 모델** - TypeScript 인터페이스 정의 (엔티티 타입 참조)
3. **API 인터페이스** - Factory 함수, Hooks, Query Keys
4. **주요 유저 플로우** - ASCII 다이어그램으로 주요 플로우
5. **UI 이벤트 스크립트** - 각 UI 컴포넌트의 상세 이벤트 핸들러
6. **상태 관리** - 상태 위치 및 관리 방식 (TanStack Query / useState / Context)
7. **폴백/에러 처리** - 예외 상황별 처리 전략

### UI 이벤트 스크립트 작성 규칙

각 이벤트 핸들러에 다음을 상세히 기술:

```
on[EventName]() {
  // 1. 사전 검증 (disabled, loading check)
  // 2. 햅틱 피드백
  // 3. UI 상태 업데이트
  // 4. Validation (필드 레벨)
  // 5. 실제 로직 실행
  // 6. 성공/실패 처리
  // 7. 다음 상태로 전이
}
```

### 타입 참조 위치

- Entry: `src/entities/entry/model/types.ts`
- Budget: `src/entities/budget/model/types.ts`
- Category: `src/entities/category/model/types.ts`
- Family: `src/entities/family/model/types.ts`
- User: `src/entities/user/model/types.ts`
- SyncQueue: `src/entities/sync-queue/model/types.ts`

## 개발 규칙

1. **컴포넌트 내 지역 타입 우선** - `Props`나 내부 상태는 `.tsx` 파일 내에 선언
2. **model vs lib 구분** - 비즈니스 로직은 `model/`, 기술적 유틸리티는 `lib/`
3. **TanStack Query Key Factory** - `ENTRY_KEYS.all()`, `ENTRY_KEYS.list()`等形式
4. **Public API Barrel** - 모든 slice는 `index.ts` 필수, `export *` 금지