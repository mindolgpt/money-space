# Feature Model Restructure

## Status: COMPLETED

## Summary of Changes

Each feature's `model/` directory was restructured to separate types, zustand stores (hooks), and helper functions. Additionally, several features were reorganized from flat layout to domain-grouped layout.

## Changes Applied

### entry/add-entry/model/
- `types.ts` — `EntryFormState` interface
- `use-entry-form-store.ts` — `useEntryFormStore` hook
- Feature barrel at `entry/add-entry/index.ts` (not model-level barrel)

### entry/search-entries/model/
- `types.ts` — `SearchState` interface
- `use-search-store.ts` — `useSearchStore` hook

### auth/auth-manager/model/
- `types.ts` — re-exports `AuthUser` from `entities/user`
- `use-auth-store.ts` — `useAuthStore` hook + internal `AuthState` type
- Token storage (`storeTokens`, `getAccessToken`, `clearTokens`) moved to `entities/user/lib/token-storage.ts`

### family/family-invite/
- **REMOVED**: `use-invite-store.ts` — replaced by entity hooks `useInviteByEmail`, `useAcceptInvite` from `entities/family`
- UI components now use entity hooks directly
- No model directory (removed entirely)

### sync/sync-engine/
- `types.ts` — `RealtimePayload` type
- `create-entry-locally.ts` — `createEntryLocally`
- `modify-entry-locally.ts` — `modifyEntryLocally`
- `remove-entry-locally.ts` — `removeEntryLocally`
- `push-pending-changes.ts` — `pushPendingChanges`
- `subscribe-to-realtime.ts` — moved to `lib/` (technical concern, not business logic)
- `lib/subscribe-to-realtime.ts` — uses `createEntryApi().remote.subscribe()`

### budget/budget-manager/model/
- Empty — no model files needed

### entry/edit-entry/
- Empty placeholder — no model files

## What Does NOT Change
- File contents (types, hook implementations, function bodies) remain identical (except path changes)
- Feature-level `index.ts` imports stay the same
- External consumers (pages, entities, etc.) are unaffected

## Additional Refactoring

- `type.ts` → `types.ts` (plural) for consistency
- Entity types moved from `model/index.ts` to `model/types.ts` where applicable
- No internal `model/index.ts` barrels in features (segment-level barrels are discouraged by FSD)