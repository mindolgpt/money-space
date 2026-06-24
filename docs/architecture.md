# Money-Space Architecture

## System Overview

Offline-first personal finance app. Entries are written to local SQLite immediately (optimistic), then synced to Supabase asynchronously via a sync queue. Reads always hit local SQLite first.

```
┌────────────────────────────────────────────────────────────┐
│                    Expo (React Native)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (thin wrappers) → Features → Widgets          │  │
│  │                    ↓                                 │  │
│  │  Entities (domain model + API hooks + factory)       │  │
│  │                    ↕                                 │  │
│  │  Shared API layer (sqlite.ts + supabase.ts)          │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│        ┌────────────┴────────────┐                        │
│        ▼                         ▼                        │
│   expo-sqlite              @supabase/supabase-js          │
│   (local DB)               (remote API)                   │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo ~54.0 / React Native 0.81 |
| Language | TypeScript strict |
| Routing | expo-router ~6.0 (file-based) |
| Styling | nativewind ^4.2 (Tailwind CSS) |
| Local DB | expo-sqlite ~16 (sync API) |
| Remote DB | Supabase (PostgreSQL) |
| Server State | @tanstack/react-query ^5 |
| Client State | zustand ^5 |
| Navigation | react-native-screens ~4.16 |
| Animation | motion ^12.40, react-native-reanimated ~4.1 |
| Icons | lucide-react-native ^1.21 |

## Route Design

Expo Router file-based routing:

```
app/
  _layout.tsx          Root Stack — ErrorBoundary > Providers > Stack
  index.tsx            → pages/home/ui/HomeScreen
  details.tsx          → pages/details/ui/DetailScreen
  (tabs)/
    _layout.tsx        Tab navigator + custom TabBar component
    index.tsx          Home (tab 1)
    statistics.tsx     Statistics (tab 2)
    shared.tsx         Family Shared (tab 3)
    calendar.tsx       Calendar (tab 4)
    settings.tsx       Settings (tab 5)
  auth/
    _layout.tsx        Auth Stack
    login.tsx          LoginForm
    register.tsx       RegisterForm → redirect to /onboarding
    reset-password.tsx PasswordResetForm
  invite/
    [code].tsx         Dynamic route — AcceptInvite via useLocalSearchParams
  onboarding/
    index.tsx          3-step: slides → permissions → budget
```

All `app/` screens are thin wrappers (5–20 lines) delegating to `@/pages/` or `@/features/`.

## FSD Layer Structure

### Layer Map

```
src/
  shared/              Infrastructure & design system
    api/               Supabase client + domain wrappers
    config/            Env vars & constants
    lib/               Utilities (db, logger, theme, uuid)
    ui/                Design system (Button, Input, Card, etc.)
  entities/            Core business models & data access
    entry/             Entry CRUD + remote/local split API
    budget/            Budget settings + progress
    category/          Category CRUD + reorder
    family/            Family + members + invites
    user/              Auth + profile + settings
    sync-queue/        Pending changes queue
  features/            Business features (one per use case)
    auth/auth-manager/ Login, register, password reset
    entry/add-entry/   Entry creation form
    entry/edit-entry/  Entry edit modal
    entry/search-entries/ Search with debounce
    budget/budget-manager/ Budget per category
    family/family-manager/ Family member management
    sync/sync-engine/  Offline queue + conflict resolution
    ...
  pages/               Screen components (ui/ + index.ts only)
    home/              HomeScreen
    settings/          SettingsScreen
    statistics/        StatisticsScreen
    calendar/          CalendarScreen
    shared/            SharedScreen
    details/           DetailScreen
    family/            FamilyManagerScreen
    category/          CategoryManagerScreen
  widgets/             Reusable UI blocks (flat, no sub-segments)
    quick-input/       Floating action button + quick amount input
    recent-entries/    Recent entry list with swipe actions
    budget-progress/   Budget progress bar with pulse animation
    sync-status/       Sync state indicator
    period-selector/   Week/Month/Year selector
    ...
```

### Entity Barrel Pattern

Every entity exports via `index.ts`:

```typescript
// src/entities/entry/index.ts
export type { Entry, CreateEntryInput, ... } from './model/types'
export { createEntryLocally, modifyEntryLocally, removeEntryLocally } from './model/...'
export { createEntryApi, useEntries, useCreateEntry, ..., ENTRY_KEYS } from './api'
```

Features/pages/widgets **must** import only from entity barrel (`@/entities/entry`), never from internal paths.

### Entity API Factory Pattern

Two variants:

| Variant | Entities | Shape |
|---------|----------|-------|
| Remote/Local split | entry, family, user | `{ remote: {...}, local: {...} }` |
| Flat | category, budget, sync-queue | `{ getAll, ..., remote: {...} }` |

## Provider Hierarchy

Nesting order (outermost → innermost) in `src/providers.tsx`:

```
ErrorBoundary (in app/_layout.tsx)
  QueryClientProvider    retry: 1, staleTime: 5 min
    ThemeProvider        zustand store + React context
      ThemeInitializer   Syncs store mode to CSS on mount
        NotificationsProvider  Lazy import, channels, permission
          AuthRouter     Session restore → auth listener → biometric → route guard → periodic sync
            NetworkMonitor   Online/offline → pushPendingChanges()
              <App />
```

## Data Flow

### Write Path (Offline-First)

```
User Input → Feature Hook (useCreateEntry)
  → createEntryLocally()     — writes SQLite + generates optimistic cache
  → addToSyncQueue()         — enqueues pending change
  → UI updates instantly     — TanStack Query cache
  → SyncEngine (background)  — pushPendingChanges() → Supabase
```

### Read Path (Local-First)

```
Screen → useEntries() hook  — TanStack Query
  → entrySqlite.getEntriesByMonth() — reads SQLite
  → cached indefinitely     — staleTime: Infinity (no auto-refetch)
  → invalidated on mutate   — onSettled/onSuccess
```

## Sync Engine Architecture

```
pushPendingChanges()
  → read pending_changes queue
  → for each item:
    → apply to Supabase
    → on success: remove from queue
    → on conflict (updatedAt comparison):
      → resolve by strategy (local wins / remote wins / merge)
      → mark as failed or retry (max SYNC_RETRY_MAX)
  → triggers on:
    - app foreground (AuthRouter effect)
    - network come back online (NetworkMonitor)
    - periodic interval (SYNC_INTERVAL_MS)
    - manual (useManualSync hook)
```

## Database Schema

SQLite tables (defined in `src/shared/lib/db.ts`). All timestamps use ISO 8601 strings.

### entries

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | `generateId()` |
| user_id | TEXT NOT NULL | FK to auth user |
| family_id | TEXT | nullable |
| category_id | TEXT | nullable |
| amount | INTEGER NOT NULL | 양수, 단위: 원 |
| type | TEXT | `'income' \| 'expense' \| 'saving'` |
| payment_method | TEXT | `'cash' \| 'card' \| 'account' \| 'transfer'` |
| note | TEXT | nullable, max 500자 |
| date | TEXT NOT NULL | `"YYYY-MM-DD"` |
| photo_urls | TEXT | JSON string array |
| latitude | REAL | nullable |
| longitude | REAL | nullable |
| location_name | TEXT | nullable |
| is_shared | INTEGER | `0` or `1` |
| is_recurring | INTEGER | `0` or `1` |
| recurring_rule | TEXT | rrule string |
| created_at | TEXT | datetime('now') |
| updated_at | TEXT | datetime('now') |

### categories

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| user_id | TEXT NOT NULL | |
| name | TEXT NOT NULL | |
| icon | TEXT | emoji string |
| type | TEXT | `'income' \| 'expense' \| 'saving'` |
| is_shared | INTEGER | `0` or `1` |
| is_system | INTEGER | `0` or `1` (system categories cannot be edited/deleted) |
| sort_order | INTEGER | drag-reorder |
| created_at | TEXT | |

### budgets

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| user_id | TEXT | nullable (personal) |
| family_id | TEXT | nullable (shared) |
| category_id | TEXT | |
| amount | INTEGER NOT NULL | |
| month | TEXT NOT NULL | `"2024-01"` format |
| created_at | TEXT | |
| UNIQUE | (user_id, category_id, month) | |

### families

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| name | TEXT NOT NULL | |
| invite_code | TEXT | nullable |
| created_at | TEXT | |

### family_members

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| family_id | TEXT NOT NULL | |
| user_id | TEXT NOT NULL | |
| role | TEXT | `'admin' \| 'member' \| 'viewer'` |
| joined_at | TEXT | |
| UNIQUE | (family_id, user_id) | |

### pending_changes (sync queue)

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| table_name | TEXT | `'entries'`, `'budgets'`, `'categories'` |
| record_id | TEXT | local ID |
| operation | TEXT | `'insert' \| 'update' \| 'delete'` |
| payload | TEXT | JSON string |
| status | TEXT | `'pending' \| 'syncing' \| 'failed' \| 'completed'` |
| retry_count | INTEGER | default 0 |
| created_at | TEXT | |

### user_settings

| Column | Type | Default |
|--------|------|---------|
| user_id | TEXT PK | |
| theme | TEXT | `'light'` |
| currency | TEXT | `'KRW'` |
| language | TEXT | `'ko'` |
| notifications | TEXT | `'{}'` JSON |
| security | TEXT | `'{}'` JSON |
| sync | TEXT | `'{}'` JSON |
| updated_at | TEXT | |

### category_usage

| Column | Type | Notes |
|--------|------|-------|
| user_id | TEXT NOT NULL | |
| type | TEXT | `'income' \| 'expense' \| 'saving'` |
| category_id | TEXT NOT NULL | |
| used_at | TEXT | datetime('now') |
| PRIMARY KEY | (user_id, type) | |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite-first reads** | Offline support by default. No loading states for cached data. |
| **Optimistic writes** | Entries appear instantly in UI. SyncQueue handles eventual consistency. |
| **TanStack Query + zustand** | Server state via RQ (caching, invalidation, background sync). Client state (auth, theme, form) via zustand. |
| **No feature-to-feature imports** | FSD rule: features communicate only through entity barrels or pages. Prevents circular deps. |
| **Separate babel for tests** | nativewind + reanimated plugins break Jest. `babel.config.test.js` strips them. |
| **Custom TabBar** | lucide icons + Tailwind styling. BottomTabBar default is not customizable enough. |
| **Sync-queue as isolated entity** | Shared by all domains. Single queue with `table_name` discriminator. |
