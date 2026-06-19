# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# FSD 아키텍처 규칙

이 프로젝트는 FSD(Feature-Sliced Design) 원칙을 따릅니다. features와 pages 레이어 하위가 [도메인]별로 그룹화되어 있습니다.

## 레이어 구조
- `src/features/[도메인명]/[기능명]/ui/`, `model/`, `lib/`
- `src/pages/[도메인명]/[페이지명]/ui/`, `model/`
- `src/widgets/[위젯명]/` — 각 위젯 slice는 `index.ts` Public API 필수
- `src/entities/[도메인명]/model/types.ts`, `api/index.ts`, `lib/`
- `src/shared/api/[도메인명]/` — sqlite + supabase 분리, `index.ts` barrel 필수
- `src/shared/config/index.ts`, `src/shared/lib/index.ts` — segment barrel 필수

## 타입 배치 규칙

### 1. 지역 타입 (컴포넌트 `.tsx` 파일 내부)
- 특정 컴포넌트 내부에서만 단독으로 사용하는 타입은 해당 `.tsx` 파일 내부에 선언
- 처음부터 `model/types.ts`로 분리하는 오버엔지니어링 금지
- 대상: 해당 컴포넌트 전용 `Props`, 내부 `useState`/`useReducer` 상태 구조

### 2. Shared 레이어 (`src/shared`)
- 프로젝트 전역에서 비즈니스 로직과 관계없이 재사용되는 공통 타입
- 위치: `src/shared/model/types.ts` 또는 `src/shared/ui/[컴포넌트명]/types.ts`
- 대상: 공통 API 응답 규격, 페이징 구조, 디자인 시스템 공통 컴포넌트 Props

### 3. Entities 레이어 (`src/entities`)
- 비즈니스 핵심 도메인 모델 타입, 여러 features/pages에서 공통 참조
- 위치: `src/entities/[도메인명]/model/types.ts`
- 대상: DB 스키마 기반 데이터 구조 (Entry, User, Budget, Category, Family 등)

### 4. Features 레이어 (`src/features`)
- 특정 기능 전용 타입 (폼 데이터, 액션, 기능 전용 API 요청)
- 위치: `src/features/[도메인명]/[기능명]/model/types.ts`
- 대상: `LoginPayload`, `SearchFilterOptions` 등

### 5. Widgets & Pages 레이어
- 특정 UI 블록/페이지 전용 타입, 다른 곳에서 재사용되지 않음
- 위치: `src/widgets/[슬라이스명]/model/types.ts`, `src/pages/[도메인명]/[페이지명]/model/types.ts`

## Public API 규칙 (필수)
1. **모든 slice는 `index.ts` barrel 필수**: entities, features, pages, widgets 모두 최상위 `index.ts` 보유
2. **명시적 named export만 사용**: `export *` 금지. `export { createEntryApi, useEntries, ENTRY_KEYS }` 형태로 명시
3. **segment-level `index.ts` 금지**: `ui/`, `model/`, `api/` 내부에는 `index.ts` 만들지 않음
4. **deep import 금지**: 외부에서 `@/entities/entry/model/types` 직접 import 금지. 반드시 `@/entities/entry` barrel로 접근
5. **Shared segment barrel 필수**: `shared/api/[도메인명]/index.ts`, `shared/config/index.ts`, `shared/lib/index.ts` 필수
6. **Runtime side-effect가 있는 모듈은 barrel에서 제외**: `shared/config/env.ts`는 직접 import

## 데이터 접근 규칙 (FSD layer rule)

```
shared/api/supabase.ts (base client)
  └─ shared/api/<domain>/supabase.ts (domain supabase wrapper)
      └─ entities/<domain>/api/index.ts (entity API factory + hooks)
          └─ features/pages/widgets (entity barrel만 import)
```

1. **Feature/PAGE/WIDGET이 직접 supabase import 금지**: 반드시 entity barrel(`@/entities/<domain>`)을 통해서만 데이터 접근
2. **Entity API factory = 유일한 supabase 접근 통로**: `shared/api/<domain>/supabase.ts`는 `entities/<domain>/api/index.ts`만 import 가능
3. **Entity barrel은 두 가지 내보내기**: 
   - `createXxxApi()` — factory (비React 코드에서 사용, e.g. sync-engine model)
   - `useXxx*()` — TanStack Query hooks (React 컴포넌트에서 사용)
4. **Feature는 hooks 우선 사용**: zustand store에서 factory 직접 호출 금지. hooks + local state 패턴 사용

## TanStack Query 규칙
1. 모든 query key는 **key factory** 사용: `ENTRY_KEYS.all()`, `ENTRY_KEYS.list(userId, year, month)`
2. invalidation은 반드시 key factory로: `queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })`
3. Entity `api/index.ts`에서 key factory 정의 + export

## model vs lib 세그먼트 구분 규칙

슬라이스 내부에서 다음 기준으로 `model/`과 `lib/`을 구분한다:

### model/ (비즈니스 로직, 상태 관리)
- 비즈니스 도메인과 직접 연관된 커스텀 훅 (`use-auth-store.ts`, `use-search-store.ts`)
- 상태 관리 (zustand store 등)
- API 호출 및 데이터 가공 파일
- 도메인 타입 정의 (`types.ts`)
- 대상 예: `model/use-auth-store.ts`, `model/types.ts`, `model/create-entry-locally.ts`

### lib/ (순수 유틸리티, 기술적 기능, 외부 연동)
- 비즈니스와 무관한 순수 유틸리티 함수
- 기술적 기능 (디바운스, 쓰로틀, 포매터, 검증기)
- 외부 라이브러리 연동 래퍼 (SecureStore, AsyncStorage, 사운드, 애니메이션 헬퍼)
- **단, UI 관련 훅이더라도 기술적 기능(예: `use-click-outside.ts`, `use-debounce.ts`)이면 lib/**
- 대상 예: `lib/format-date.ts`, `lib/use-click-outside.ts`, `lib/token-storage.ts`, `lib/validate-form.ts`

### 구분 기준
- **비즈니스 도메인 용어**가 코드에 등장하는가? → `model/`
- **비즈니스 도메인과 무관**하게 다른 프로젝트에서도 재사용 가능한 기술인가? → `lib/`
- 모호하다면 `model/` 우선 (나중에 `lib/`로 이동하는 것은 쉬움)
