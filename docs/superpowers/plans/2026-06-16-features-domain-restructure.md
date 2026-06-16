# Feature Domain Restructure Implementation Plan

> **STATUS: COMPLETED** — This plan has been fully executed.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `src/features/` from flat layout to `features/<domain>/<feature>/model/` + `ui/` + `index.ts`

**Architecture:** Pure structural refactoring — no logic changes. Every file content stays identical except barrel `index.ts` paths.

**Tech Stack:** TypeScript, Expo

---

### Task 1: Create new directory tree

- [ ] **Create directories**

```bash
mkdir -p src/features/entry/add-entry/model src/features/entry/add-entry/ui
mkdir -p src/features/entry/search-entries/model src/features/entry/search-entries/ui
mkdir -p src/features/entry/edit-entry/model src/features/entry/edit-entry/ui
mkdir -p src/features/auth/auth-manager/model src/features/auth/auth-manager/ui
mkdir -p src/features/budget/budget-manager/model src/features/budget/budget-manager/ui
mkdir -p src/features/family/family-invite/model src/features/family/family-invite/ui
mkdir -p src/features/sync/sync-engine/model src/features/sync/sync-engine/ui
```

### Task 2: Move files to new locations

- [ ] **Move add-entry files**

```bash
mv src/features/add-entry/model.ts src/features/entry/add-entry/model/index.ts
mv src/features/add-entry/ui/*.tsx src/features/entry/add-entry/ui/
mv src/features/add-entry/index.ts src/features/entry/add-entry/index.ts
```

- [ ] **Move search-entries files**

```bash
mv src/features/search-entries/model.ts src/features/entry/search-entries/model/index.ts
mv src/features/search-entries/ui/*.tsx src/features/entry/search-entries/ui/
mv src/features/search-entries/index.ts src/features/entry/search-entries/index.ts
```

- [ ] **Move edit-entry files**

```bash
# edit-entry has only an empty ui/ dir — just create an empty barrel
# Skip (already created in Task 1)
```

- [ ] **Move auth files**

```bash
mv src/features/auth/model.ts src/features/auth/auth-manager/model/index.ts
mv src/features/auth/ui/*.tsx src/features/auth/auth-manager/ui/
mv src/features/auth/index.ts src/features/auth/auth-manager/index.ts
```

- [ ] **Move budget-manager files**

```bash
mv src/features/budget-manager/ui/BudgetList.tsx src/features/budget/budget-manager/ui/
mv src/features/budget-manager/index.ts src/features/budget/budget-manager/index.ts
echo 'export {}' > src/features/budget/budget-manager/model/index.ts
```

- [ ] **Move family-invite files**

```bash
mv src/features/family-invite/model.ts src/features/family/family-invite/model/index.ts
mv src/features/family-invite/ui/*.tsx src/features/family/family-invite/ui/
mv src/features/family-invite/index.ts src/features/family/family-invite/index.ts
```

- [ ] **Move sync-engine files**

```bash
mv src/features/sync-engine/queue.ts src/features/sync/sync-engine/model/queue.ts
mv src/features/sync-engine/pusher.ts src/features/sync/sync-engine/model/pusher.ts
mv src/features/sync-engine/listener.ts src/features/sync/sync-engine/model/listener.ts
mv src/features/sync-engine/index.ts src/features/sync/sync-engine/index.ts
```

### Task 3: Update barrel export paths

- [ ] **Update sync-engine/index.ts** — re-exports now point to `./model/queue`, `./model/pusher`, `./model/listener`

Old content:
```ts
export {
  createEntryLocally,
  modifyEntryLocally,
  removeEntryLocally,
} from './queue'
export { pushPendingChanges } from './pusher'
export { subscribeToRealtime } from './listener'
```

New content:
```ts
export {
  createEntryLocally,
  modifyEntryLocally,
  removeEntryLocally,
} from './model/queue'
export { pushPendingChanges } from './model/pusher'
export { subscribeToRealtime } from './model/listener'
```

- [ ] **Create edit-entry/index.ts** — empty barrel

```ts
export {}
```

- [ ] **Create edit-entry/model/index.ts** — empty barrel

```ts
export {}
```

### Task 4: Update external imports

Update all import paths in non-feature files to use new domain layout:

- [ ] **`src/app/providers.tsx`** — change `'../features/auth'` → `'../features/auth/auth-manager'`, `'../features/sync-engine'` → `'../features/sync/sync-engine'`

- [ ] **`src/pages/home/ui/HomeScreen.tsx`** — change:
  - `'../../../features/auth'` → `'../../../features/auth/auth-manager'`
  - `'../../../features/add-entry'` → `'../../../features/entry/add-entry'`
  - `'../../../features/search-entries'` → `'../../../features/entry/search-entries'`

- [ ] **`src/pages/calendar/ui/CalendarScreen.tsx`** — change `'../../../features/auth'` → `'../../../features/auth/auth-manager'`

- [ ] **`src/pages/settings/ui/SettingsScreen.tsx`** — change:
  - `'../../../features/auth'` → `'../../../features/auth/auth-manager'`
  - `'../../../features/budget-manager'` → `'../../../features/budget/budget-manager'`

- [ ] **`src/pages/shared/ui/SharedScreen.tsx`** — change:
  - `'../../../features/auth'` → `'../../../features/auth/auth-manager'`
  - `'../../../features/family-invite'` → `'../../../features/family/family-invite'`

- [ ] **`src/pages/statistics/ui/StatisticsScreen.tsx`** — change `'../../../features/auth'` → `'../../../features/auth/auth-manager'`

### Task 5: Update cross-feature imports within features

- [ ] **`src/features/entry/add-entry/ui/EntryForm.tsx`** — change:
  - `'../../../features/auth'` → `'../../../auth/auth-manager'`
  - `'../../../features/sync-engine'` → `'../../../sync/sync-engine'`

### Task 6: Clean up old directories

- [ ] **Remove empty old feature dirs**

```bash
rm -rf src/features/add-entry
rm -rf src/features/search-entries
rm -rf src/features/edit-entry
rm -rf src/features/auth
rm -rf src/features/budget-manager
rm -rf src/features/family-invite
rm -rf src/features/sync-engine
```

### Task 7: Verify

- [ ] **Run lint**

```bash
npx expo lint
```
Expected: 0 errors, 0 warnings

- [ ] **Run tests**

```bash
npx jest --no-cache
```
Expected: All tests pass

- [ ] **Run format**

```bash
npm run format
```
Expected: No changes (or format any new files)
