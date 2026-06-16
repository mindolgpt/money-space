# Feature Domain Restructure

## Status: COMPLETED

## Problem

Features were flat under `src/features/` with inconsistent naming and no domain grouping:
- `add-entry/`, `search-entries/`, `edit-entry/` (all entry-related, but not grouped)
- `auth/` vs `budget-manager/` vs `family-invite/` vs `sync-engine/` (mixed naming conventions)

This makes it hard to understand which features belong to which domain and doesn't follow FSD conventions for feature composition.

## Goal

Restructured `src/features/` to follow the pattern:

```
features/<domain>/<feature>/model/
features/<domain>/<feature>/ui/
features/<domain>/<feature>/lib/
features/<domain>/<feature>/index.ts
```

## Domain/Feature Mapping

| Domain    | Feature(s)                        |
|-----------|-----------------------------------|
| `entry`   | `add-entry`, `search-entries`, `edit-entry` |
| `auth`    | `auth-manager`                    |
| `budget`  | `budget-manager`                  |
| `family`  | `family-invite`                   |
| `sync`    | `sync-engine`                     |

## Current File Layout

```
src/features/
  entry/
    add-entry/
      model/types.ts              (EntryFormState interface)
      model/use-entry-form-store.ts
      ui/AmountInput.tsx
      ui/CategoryPicker.tsx
      ui/EntryForm.tsx
      ui/PaymentMethodSelector.tsx
      index.ts

    search-entries/
      model/types.ts              (SearchState interface)
      model/use-search-store.ts
      ui/SearchSheet.tsx
      index.ts

    edit-entry/
      index.ts                    (empty barrel)

  auth/
    auth-manager/
      model/types.ts              (re-exports AuthUser from entities/user)
      model/use-auth-store.ts
      ui/LoginForm.tsx
      ui/RegisterForm.tsx
      lib/token-storage.ts        (moved to entities/user/lib)
      index.ts

  budget/
    budget-manager/
      ui/BudgetList.tsx
      index.ts

  family/
    family-invite/
      ui/AcceptInvite.tsx          (uses useAcceptInvite from entities/family)
      ui/InviteScreen.tsx         (uses useInviteByEmail from entities/family)
      index.ts

  sync/
    sync-engine/
      model/types.ts              (RealtimePayload type)
      model/create-entry-locally.ts
      model/modify-entry-locally.ts
      model/remove-entry-locally.ts
      model/push-pending-changes.ts
      lib/subscribe-to-realtime.ts
      index.ts
```

## Key Design Decisions

1. **Model-level `index.ts` barrels are NOT created** — FSD recommends against segment-level barrels
2. **Token storage** moved to `entities/user/lib/token-storage.ts` (per FSD auth guidelines)
3. **Family-invite** no longer has model/ directory — uses entity hooks directly in UI components
4. **`subscribe-to-realtime.ts`** placed in `lib/` (technical/Realtime concern) not `model/` (business logic)
5. **Features use entity hooks** for data access: `useInviteByEmail`, `useAcceptInvite` from `entities/family`

## What Does NOT Change

- File contents (except barrel import paths in the moved `index.ts`)
- Export names, function signatures, types
- Entity, shared, widget, page, app layers — only import paths update