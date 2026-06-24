# Money-Space

오프라인 우선 가계부 앱 (Expo ~54.0, React Native 0.81, TypeScript strict, nativewind v4, Supabase + SQLite).

## Quick Commands

| 명령 | 실행 |
|------|------|
| Start | `npx expo start` |
| Test | `npx jest` (jest-expo preset, `src/test/` root) |
| Lint | `npx expo lint` (eslint flat config, `eslint-config-expo`) |
| Format | `npx prettier --write .` |
| Path alias | `@/` → `src/` (tsconfig + babel module-resolver) |

## Expo

Read exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Routing

- `app/(tabs)/` — 5 Tab screens (TabBar custom component)
- `app/auth/` — login, register, reset-password (Stack nav)
- `app/details.tsx` — standalone Stack screen
- `app/invite/[code].tsx` — dynamic route (expo-router `useLocalSearchParams`)
- `app/onboarding/` — 3-step onboarding
- All `app/` screens are thin wrappers (delegate to `@/pages/` or `@/features/`)
- Auth redirect: `router.replace()` (not push)

## Providers

`src/providers.tsx` hierarchy (outer → inner):
`QueryClientProvider` > `ThemeProvider` > `ThemeInitializer` > `NotificationsProvider` > `AuthRouter` > `NetworkMonitor`

- QueryClient: `retry: 1`, `staleTime: 5 min`
- AuthRouter: session restore + auth listener + biometric + route guard + periodic sync
- NetworkMonitor: online/offline → auto `pushPendingChanges()`

## Testing

- `jest.config.js` → preset `jest-expo`, roots `src/test/`
- `babel.config.test.js` — separate babel (no nativewind/reanimated in tests)
- Mock pattern: `src/test/__mocks__/expo-sqlite.ts` (in-memory SQL Map, exports `resetDb()`)
- All tests are SQLite/data-layer only (no component tests yet)
- File location: `src/test/<layer>/<domain>/<testname>.test.ts`

## FSD Layer Rules

- `src/entities/[domain]/model/types.ts` — DB 스키마 기반 도메인 모델
- `src/entities/[domain]/api/index.ts` — API factory + hooks + query key factory, barrel export
- `src/features/[domain]/[feature]/ui/`, `model/` — 기능 전용. 간단한 기능은 `ui/`만 있어도 됨
- `src/pages/[domain]/ui/`, `index.ts` — 페이지. `model/` 없음 (단순 wrapper)
- `src/widgets/[name]/` — flat 구조 (하위 segment 없음). `index.ts` + `*.tsx`
- `src/shared/api/[domain]/sqlite.ts` + `supabase.ts` + `index.ts` barrel
- `src/shared/lib/index.ts`, `src/shared/config/index.ts` — segment barrel 필수

### Public API 규칙

1. 모든 slice `index.ts` barrel 필수 (entities/features/pages/widgets)
2. **명시적 named export만**: `export { X }` — `export *` 금지 (예외: `shared/ui/icons/index.ts` → legacy)
3. `ui/`, `model/`, `api/` 내부 `index.ts` 금지
4. Deep import 금지 — 반드시 slice barrel(`@/entities/entry`)로 접근
5. Runtime side-effect 모듈(`env.ts`)은 barrel에서 제외, 직접 import

### Data Access

```
shared/api/supabase.ts (base client)
  └─ shared/api/<domain>/supabase.ts
      └─ entities/<domain>/api/index.ts (factory + hooks)
          └─ features/pages/widgets (entity barrel만 import)
```

- Feature/PAGE/WIDGET → 직접 supabase import 금지. 반드시 `@/entities/<domain>` barrel
- Entity barrel은 `createXxxApi()` (비React) + `useXxx*()` (React hooks) 둘 다 export
- Feature는 hooks 우선 사용 (factory 직접 호출 금지)

## TanStack Query

- 모든 query key는 **key factory** 사용: `ENTRY_KEYS.all()`, `ENTRY_KEYS.list(userId, year, month)`
- Invalidation: `queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })`
- Key factory 정의 + export 위치: `entities/<domain>/api/index.ts`
- Naming: `ENTRY_KEYS`, `FAMILY_KEYS`, `CATEGORY_KEYS`, `BUDGET_KEYS`, `AUTH_KEYS`, `USER_KEYS`, `SYNC_KEYS`

## model vs lib

- `model/`: 비즈니스 도메인 관련 (store, hooks, API call, types)
- `lib/`: 기술적/범용 유틸리티 (format-date, debounce, token-storage, click-outside)
- 모호하면 `model/` 우선

## Entity API Factory Pattern

```typescript
// entry/family/user — { remote, local } split
createEntryApi() → { remote: { fetchAll, subscribe, upsert }, local: { insert, getById, update, delete } }

// category/budget/sync-queue — flat structure
createCategoryApi() → { getAll, getByType, remote: { fetchByType } }
```

## User Entity Exception

`entities/user/api/index.ts`가 `shared/api/supabase`를 직접 import (avatar upload). 이는 유일한 예외.

## Architecture

전체 아키텍처 개요: `docs/architecture.md` (FSD layer map, data flow, provider hierarchy, sync engine, route design).

## Common Conventions

### Components
- `export function ComponentName({ prop }: Props)` — named export only, no `export default`
- `Props` type defined locally above component, never imported from elsewhere
- Style: 100% NativeWind `className`, no `StyleSheet.create`
- Spacing: Tailwind numeric scale (`p-4`, `gap-2`, `mb-6`), base unit 16px
- Feedback: `Alert.alert('', message)` for all toast/dialog (no toast library)
- Keyboard: `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}`
- Form state: local `useState` with `INITIAL_STATE` constant + `onFieldChange<K>(key, value)` updater
- Form dirty check: `hasChanges` boolean + confirm dialog on close
- Modals: `animationType="slide"` + `presentationStyle="pageSheet"`, wrapper `<View className="flex-1 bg-bg-primary">`
- Event handler naming: `on` + PascalCase (`onSave`, `onClose`) or `handle` prefix (`handleAmountChange`)

### Navigation (expo-router)
- `router.replace()` for auth redirects (`/auth/login`, `/(tabs)`)
- `router.push()` for normal navigation; cast route params with `as any`
- All `app/` screens are thin wrappers (delegate to `@/pages/` or `@/features/`)

### Data Fetching
- TanStack Query hooks: `staleTime: Infinity` for local SQLite queries (never auto-refetch)
- Mutations: `useMutation` with `onMutate` (optimistic update), `onError` (rollback), `onSettled` (invalidate)
- Pull-to-refresh: `setRefreshing(true)` → `await refetch()` → `setTimeout(() => setRefreshing(false), 300)`
- Entity barrel always exports `createXxxApi()` (non-React) + `useXxx*()` (React hooks) + `XXX_KEYS`

### Animations
- `useAnimatedStyle` + `withSpring(stiffness, damping)` from react-native-reanimated
- motion library `^12.40` available for declarative animation

### State Management
- Server/cache state: TanStack Query (`@tanstack/react-query ^5`)
- Client/UI state: zustand `^5` (auth, theme, form UI), `useState` (local form data)
- No zustand `persist` middleware used anywhere

### Tests
- Location: `src/test/<layer>/<domain>/<testname>.test.ts`
- Preset: `jest-expo`, config in `babel.config.test.js` (no nativewind/reanimated)
- Mock: `expo-sqlite` → `src/test/__mocks__/expo-sqlite.ts` (in-memory Map, `resetDb()`)
- Data-layer only (SQLite), no component tests

## Design

| 문서 | 경로 | 내용 |
|------|------|------|
| Style Guide | `docs/design/style-guide.md` | Color palette, spacing, radii, shadows, glass effect, button/pill/badge/toggle specs |
| Design System | `docs/design/design-system.md` | Principles, component inventory, icon system, theming, CSS architecture |
| Typography | `docs/design/typography.md` | Font stack (Inter), type scale `headline-xl`~`label-sm`, weights, Typography component |

## docs/prd Reference

상세 PRD 문서는 `docs/prd/`에 있음. AI 에이전트는 필요시 아래 문서를 hit하여 컨텍스트 로드:

| 문서 | 경로 | 주요 내용 |
|------|------|-----------|
| **Index** | `docs/prd/index.md` | 전체 구조, 데이터 접근 규칙, 공통 타입 |
| **Progress** | `docs/prd/progress-tracker.md` | 기능별 완료율 99%, 도메인별 체크리스트 |
| **Entry** | `docs/prd/entry/README.md` | CRUD + 검색, `CreateEntryInput`, `ENTRY_KEYS`, UI 이벤트 스크립트 |
| **Budget** | `docs/prd/budget/README.md` | 예산 설정, 진행률, `BUDGET_KEYS` |
| **Category** | `docs/prd/category/README.md` | 카테고리 CRUD, 아이콘, 순서변경, `CATEGORY_KEYS` |
| **Auth** | `docs/prd/auth/README.md` | 이메일 로그인/회원가입, 세션, SecureStore, `AUTH_KEYS` |
| **Family** | `docs/prd/family/README.md` | 가족 초대, 멤버 역할(admin/member/viewer), `FAMILY_KEYS` |
| **Sync** | `docs/prd/sync/README.md` | 오프라인 큐, 충돌 해결, Wi-Fi only, `SYNC_KEYS` |
| **User** | `docs/prd/user/README.md` | 프로필, 알림설정, 데이터 내보내기/가져오기, `USER_KEYS` |
| **Home** | `docs/prd/home/README.md` | 메인 대시보드, QuickInput, RecentEntries, MonthlySummary |
| **Shared** | `docs/prd/shared/README.md` | 공통 UI, 컴포넌트 규칙, 이벤트 처리 |
