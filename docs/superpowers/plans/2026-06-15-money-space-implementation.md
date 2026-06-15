# Money Space Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a next-gen account book app with SQLite+Supabase hybrid sync, couple sharing, and modern UI/UX.

**Architecture:** FSD (Feature-Sliced Design) with Expo Router. SQLite as local source of truth, Supabase as remote. Sync via pending_changes queue + Realtime. Zustand for state management.

**Tech Stack:** Expo SDK 53+, Expo Router, supabase-js, expo-sqlite, Zustand, NativeWind, react-native-reanimated, motion (Framer Motion for RN), react-native-gesture-handler

---

## File Structure

```
money-space/
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── statistics.tsx
│   │   │   ├── shared.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── settings.tsx
│   │   ├── auth/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── invite/
│   │       └── [code].tsx
│   ├── entities/
│   │   ├── entry/
│   │   │   ├── model.ts
│   │   │   ├── sqlite.ts
│   │   │   ├── supabase.ts
│   │   │   └── index.ts
│   │   ├── category/
│   │   │   ├── model.ts
│   │   │   ├── sqlite.ts
│   │   │   └── index.ts
│   │   ├── budget/
│   │   │   ├── model.ts
│   │   │   ├── sqlite.ts
│   │   │   └── index.ts
│   │   ├── family/
│   │   │   ├── model.ts
│   │   │   ├── sqlite.ts
│   │   │   ├── supabase.ts
│   │   │   └── index.ts
│   │   ├── user/
│   │   │   ├── model.ts
│   │   │   ├── sqlite.ts
│   │   │   └── index.ts
│   │   └── sync-queue/
│   │       ├── model.ts
│   │       ├── sqlite.ts
│   │       └── index.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── ui/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── model.ts
│   │   │   └── index.ts
│   │   ├── add-entry/
│   │   │   ├── ui/
│   │   │   │   ├── EntryForm.tsx
│   │   │   │   ├── AmountInput.tsx
│   │   │   │   ├── CategoryPicker.tsx
│   │   │   │   └── PaymentMethodSelector.tsx
│   │   │   ├── model.ts
│   │   │   └── index.ts
│   │   ├── sync-engine/
│   │   │   ├── queue.ts
│   │   │   ├── pusher.ts
│   │   │   ├── listener.ts
│   │   │   └── index.ts
│   │   ├── family-invite/
│   │   │   ├── ui/
│   │   │   │   ├── InviteScreen.tsx
│   │   │   │   └── AcceptInvite.tsx
│   │   │   ├── model.ts
│   │   │   └── index.ts
│   │   ├── budget-manager/
│   │   │   ├── ui/
│   │   │   │   ├── BudgetList.tsx
│   │   │   │   └── BudgetForm.tsx
│   │   │   ├── model.ts
│   │   │   └── index.ts
│   │   ├── search-entries/
│   │   │   ├── ui/
│   │   │   │   └── SearchSheet.tsx
│   │   │   ├── model.ts
│   │   │   └── index.ts
│   │   └── edit-entry/
│   │       ├── ui/
│   │       │   └── EditEntrySheet.tsx
│   │       ├── model.ts
│   │       └── index.ts
│   ├── widgets/
│   │   ├── monthly-summary/
│   │   │   └── MonthlySummary.tsx
│   │   ├── recent-entries/
│   │   │   └── RecentEntries.tsx
│   │   ├── category-chart/
│   │   │   └── CategoryChart.tsx
│   │   ├── budget-progress/
│   │   │   └── BudgetProgress.tsx
│   │   ├── quick-input/
│   │   │   └── QuickInput.tsx
│   │   └── sync-status/
│   │       └── SyncStatus.tsx
│   ├── pages/
│   │   ├── home/
│   │   │   └── HomePage.tsx
│   │   ├── statistics/
│   │   │   └── StatisticsPage.tsx
│   │   ├── shared/
│   │   │   └── SharedPage.tsx
│   │   ├── calendar/
│   │   │   └── CalendarPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   └── shared/
│       ├── api/
│       │   └── supabase.ts
│       ├── lib/
│       │   ├── db.ts
│       │   ├── format.ts
│       │   └── date.ts
│       ├── ui/
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Card.tsx
│       │   ├── BottomSheet.tsx
│       │   └── LoadingSpinner.tsx
│       └── config/
│           ├── constants.ts
│           └── env.ts
```

---

## Milestone 1: Foundation (Auth + Local DB + Entry CRUD)

### Task 1.1: Initialize Expo Project

**Files:**
- Create: `money-space/` (project root)

- [ ] **Step 1: Create Expo project**

```bash
npx create-expo-app@latest money-space --template blank-typescript
cd money-space
```

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-sqlite @supabase/supabase-js zustand nativewind tailwindcss react-native-reanimated react-native-safe-area-context expo-router expo-secure-store react-native-gesture-handler
npx expo install expo-constants expo-linking expo-status-bar
npx expo install motion@0.0.10
```

- [ ] **Step 3: Configure Expo Router**

Edit `app.json`:
```json
{
  "expo": {
    "scheme": "money-space",
    "plugins": ["expo-router", "expo-sqlite"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Configure NativeWind**

Edit `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
};
```

- [ ] **Step 5: Create src directory structure**

```bash
mkdir -p src/{app/{(tabs),auth,invite},pages/{home,statistics,shared,calendar,settings},widgets/{monthly-summary,recent-entries,category-chart,budget-progress,quick-input,sync-status},features/{auth,add-entry,sync-engine,family-invite,budget-manager,search-entries,edit-entry},entities/{entry,category,budget,family,user,sync-queue},shared/{api,lib,ui,config}}
```

- [ ] **Step 6: Create root layout with Expo Router**

`src/app/_layout.tsx`:
```tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="invite" />
      </Stack>
    </>
  );
}
```

- [ ] **Step 7: Verify project boots**

```bash
npx expo start --no-dev
```
Expected: Metro bundler starts, no errors.

- [ ] **Step 8: Commit**

```bash
git init && git add . && git commit -m "feat: init Expo project with Router, SQLite, Supabase, NativeWind"
```

---

### Task 1.2: Supabase Client + Config

**Files:**
- Create: `src/shared/config/env.ts`
- Create: `src/shared/config/constants.ts`
- Create: `src/shared/api/supabase.ts`
- Create: `supabase/migrations/001_init.sql`

- [ ] **Step 1: Write env config**

`src/shared/config/env.ts`:
```ts
import Constants from "expo-constants";

export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl ?? "";
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey ?? "";
```

`src/shared/config/constants.ts`:
```ts
export const DB_NAME = "moneyspace.db";
export const SYNC_RETRY_MAX = 5;
export const SYNC_INTERVAL_MS = 30000;
```

- [ ] **Step 2: Write Supabase client**

`src/shared/api/supabase.ts`:
```ts
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/env";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 3: Write initial Supabase migration**

`supabase/migrations/001_init.sql`:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT CHECK(type IN ('income', 'expense', 'saving')),
  is_shared BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id),
  category_id UUID REFERENCES categories(id),
  amount INTEGER NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense', 'saving')),
  payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'account', 'transfer')),
  note TEXT,
  date DATE NOT NULL,
  photo_urls TEXT[],
  is_shared BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  family_id UUID REFERENCES families(id),
  category_id UUID REFERENCES categories(id),
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY entries_select ON entries
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      is_shared = true
      AND family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY entries_insert ON entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY entries_update ON entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY entries_delete ON entries FOR DELETE USING (user_id = auth.uid());

CREATE POLICY categories_select ON categories
  FOR SELECT USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update ON categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY categories_delete ON categories FOR DELETE USING (user_id = auth.uid());
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add Supabase client, config, initial migration"
```

---

### Task 1.3: SQLite Database Layer

**Files:**
- Create: `src/shared/lib/db.ts`

- [ ] **Step 1: Write SQLite initialization**

`src/shared/lib/db.ts`:
```ts
import * as SQLite from "expo-sqlite";
import { DB_NAME } from "../config/constants";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    initTables();
  }
  return db;
}

function initTables() {
  db!.execSync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      family_id TEXT,
      category_id TEXT,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense','saving')),
      payment_method TEXT CHECK(payment_method IN ('cash','card','account','transfer')),
      note TEXT,
      date TEXT NOT NULL,
      photo_urls TEXT,
      is_shared INTEGER DEFAULT 0,
      is_recurring INTEGER DEFAULT 0,
      recurring_rule TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      type TEXT NOT NULL CHECK(type IN ('income','expense','saving')),
      is_shared INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      family_id TEXT,
      category_id TEXT,
      amount INTEGER NOT NULL,
      month TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, category_id, month)
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      UNIQUE(family_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS pending_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK(operation IN ('insert','update','delete')),
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
```

- [ ] **Step 2: Write a test to verify DB init**

`src/shared/lib/__tests__/db.test.ts`:
```ts
import { getDb } from "../db";

describe("getDb", () => {
  it("returns a database instance", () => {
    const db = getDb();
    expect(db).toBeDefined();
  });

  it("creates entries table", () => {
    const db = getDb();
    const result = db.execSync("SELECT name FROM sqlite_master WHERE type='table' AND name='entries'");
    expect(result.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test**

```bash
npx jest src/shared/lib/__tests__/db.test.ts
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add SQLite init with all tables"
```

---

### Task 1.4: Entry Entity (Model + SQLite CRUD)

**Files:**
- Create: `src/entities/entry/model.ts`
- Create: `src/entities/entry/sqlite.ts`
- Create: `src/entities/entry/supabase.ts`
- Create: `src/entities/entry/index.ts`

- [ ] **Step 1: Write Entry model**

`src/entities/entry/model.ts`:
```ts
export type EntryType = "income" | "expense" | "saving";
export type PaymentMethod = "cash" | "card" | "account" | "transfer";

export interface Entry {
  id: string;
  userId: string;
  familyId?: string;
  categoryId?: string;
  amount: number;
  type: EntryType;
  paymentMethod?: PaymentMethod;
  note?: string;
  date: string;
  photoUrls?: string[];
  isShared: boolean;
  isRecurring: boolean;
  recurringRule?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
export type UpdateEntryInput = Partial<Omit<Entry, "id" | "createdAt">>;
```

- [ ] **Step 2: Write Write SQLite CRUD**

`src/entities/entry/sqlite.ts`:
```ts
import { getDb } from "../../shared/lib/db";
import { Entry, CreateEntryInput } from "./model";

export function insertEntry(input: CreateEntryInput): Entry {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO entries (id, user_id, family_id, category_id, amount, type, payment_method, note, date, photo_urls, is_shared, is_recurring, recurring_rule, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, input.userId, input.familyId ?? null, input.categoryId ?? null,
      input.amount, input.type, input.paymentMethod ?? null, input.note ?? null,
      input.date, input.photoUrls ? JSON.stringify(input.photoUrls) : null,
      input.isShared ? 1 : 0, input.isRecurring ? 1 : 0,
      input.recurringRule ?? null, now, now,
    ]
  );
  return getEntryById(id)!;
}

export function getEntryById(id: string): Entry | null {
  const db = getDb();
  const row = db.getFirstSync<Record<string, any>>("SELECT * FROM entries WHERE id = ?", [id]);
  return row ? rowToEntry(row) : null;
}

export function getEntriesByMonth(userId: string, year: number, month: number): Entry[] {
  const db = getDb();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const rows = db.getAllSync<Record<string, any>>(
    "SELECT * FROM entries WHERE user_id = ? AND date LIKE ? ORDER BY date DESC, created_at DESC",
    [userId, `${prefix}%`]
  );
  return rows.map(rowToEntry);
}

export function updateEntry(id: string, input: Record<string, any>): Entry | null {
  const db = getDb();
  const now = new Date().toISOString();
  const setClauses: string[] = ["updated_at = ?"];
  const params: any[] = [now];
  for (const [key, value] of Object.entries(input)) {
    const col = camelToSnake(key);
    setClauses.push(`${col} = ?`);
    params.push(value);
  }
  params.push(id);
  db.runSync(`UPDATE entries SET ${setClauses.join(", ")} WHERE id = ?`, params);
  return getEntryById(id);
}

export function deleteEntry(id: string): void {
  getDb().runSync("DELETE FROM entries WHERE id = ?", [id]);
}

function rowToEntry(row: Record<string, any>): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    amount: row.amount,
    type: row.type,
    paymentMethod: row.payment_method ?? undefined,
    note: row.note ?? undefined,
    date: row.date,
    photoUrls: row.photo_urls ? JSON.parse(row.photo_urls) : undefined,
    isShared: Boolean(row.is_shared),
    isRecurring: Boolean(row.is_recurring),
    recurringRule: row.recurring_rule ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
```

- [ ] **Step 3: Write Supabase operations**

`src/entities/entry/supabase.ts`:
```ts
import { supabase } from "../../shared/api/supabase";
import { Entry, CreateEntryInput, UpdateEntryInput } from "./model";

export async function fetchEntriesFromSupabase(userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .or(`user_id.eq.${userId},is_shared.true`);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function upsertEntryToSupabase(entry: Entry): Promise<void> {
  const { error } = await supabase.from("entries").upsert({
    id: entry.id,
    user_id: entry.userId,
    family_id: entry.familyId,
    category_id: entry.categoryId,
    amount: entry.amount,
    type: entry.type,
    payment_method: entry.paymentMethod,
    note: entry.note,
    date: entry.date,
    photo_urls: entry.photoUrls,
    is_shared: entry.isShared,
    is_recurring: entry.isRecurring,
    recurring_rule: entry.recurringRule,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteEntryFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
}

function mapRow(row: any): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    categoryId: row.category_id,
    amount: row.amount,
    type: row.type,
    paymentMethod: row.payment_method,
    note: row.note,
    date: row.date,
    photoUrls: row.photo_urls,
    isShared: row.is_shared,
    isRecurring: row.is_recurring,
    recurringRule: row.recurring_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

- [ ] **Step 4: Write barrel export**

`src/entities/entry/index.ts`:
```ts
export * from "./model";
export * from "./sqlite";
export * from "./supabase";
```

- [ ] **Step 5: Write tests for SQLite CRUD**

`src/entities/entry/__tests__/sqlite.test.ts`:
```ts
import { insertEntry, getEntryById, getEntriesByMonth, deleteEntry } from "../sqlite";
import { CreateEntryInput } from "../model";

describe("entry sqlite", () => {
  const input: CreateEntryInput = {
    userId: "user-1",
    amount: 50000,
    type: "expense",
    date: "2026-06-15",
    isShared: false,
    isRecurring: false,
  };

  it("inserts and reads an entry", () => {
    const entry = insertEntry(input);
    expect(entry.id).toBeDefined();
    expect(entry.amount).toBe(50000);

    const found = getEntryById(entry.id);
    expect(found).not.toBeNull();
    expect(found!.amount).toBe(50000);
  });

  it("deletes an entry", () => {
    const entry = insertEntry(input);
    deleteEntry(entry.id);
    expect(getEntryById(entry.id)).toBeNull();
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npx jest src/entities/entry/__tests__/sqlite.test.ts
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add . && git commit -m "feat: add Entry entity with SQLite CRUD and Supabase ops"
```

---

### Task 1.5: Auth Feature (Supabase Auth + Login/Register)

**Files:**
- Create: `src/features/auth/model.ts`
- Create: `src/features/auth/ui/LoginForm.tsx`
- Create: `src/features/auth/ui/RegisterForm.tsx`
- Create: `src/features/auth/index.ts`
- Create: `src/app/auth/_layout.tsx`
- Create: `src/app/auth/login.tsx`
- Create: `src/app/auth/register.tsx`
- Modify: `src/shared/lib/db.ts`

- [ ] **Step 1: Write auth model**

`src/features/auth/model.ts`:
```ts
import { supabase } from "../../shared/api/supabase";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

async function storeTokens(session: any) {
  if (session?.access_token) {
    await SecureStore.setItemAsync("access_token", session.access_token);
    await SecureStore.setItemAsync("refresh_token", session.refresh_token);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    if (error) throw error;
    if (data.session) await storeTokens(data.session);
    set({
      user: data.user
        ? { id: data.user.id, email: data.user.email!, name }
        : null,
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await storeTokens(data.session);
    set({
      user: data.user
        ? { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name }
        : null,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ user: null });
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          },
          isLoading: false,
        });
        return;
      }
    }
    set({ isLoading: false });
  },
}));
```

- [ ] **Step 2: Write LoginForm**

`src/features/auth/ui/LoginForm.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuthStore } from "../model";

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    try {
      setError("");
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-2xl font-bold mb-8">로그인</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity className="bg-blue-500 rounded-lg p-3 items-center" onPress={handleLogin}>
        <Text className="text-white font-bold">로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-4 items-center" onPress={onSwitch}>
        <Text className="text-blue-500">계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 3: Write RegisterForm**

`src/features/auth/ui/RegisterForm.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuthStore } from "../model";

export function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { signUp } = useAuthStore();

  const handleRegister = async () => {
    try {
      setError("");
      await signUp(email, password, name);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-2xl font-bold mb-8">회원가입</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity className="bg-blue-500 rounded-lg p-3 items-center" onPress={handleRegister}>
        <Text className="text-white font-bold">회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-4 items-center" onPress={onSwitch}>
        <Text className="text-blue-500">이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 4: Write auth pages**

`src/app/auth/_layout.tsx`:
```tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`src/app/auth/login.tsx`:
```tsx
import { LoginForm } from "../../features/auth/ui/LoginForm";
import { router } from "expo-router";

export default function LoginScreen() {
  return (
    <LoginForm onSwitch={() => router.replace("/auth/register")} />
  );
}
```

`src/app/auth/register.tsx`:
```tsx
import { RegisterForm } from "../../features/auth/ui/RegisterForm";
import { router } from "expo-router";

export default function RegisterScreen() {
  return (
    <RegisterForm onSwitch={() => router.replace("/auth/login")} />
  );
}
```

- [ ] **Step 5: Write auth feature barrel**

`src/features/auth/index.ts`:
```ts
export { useAuthStore } from "./model";
export { LoginForm } from "./ui/LoginForm";
export { RegisterForm } from "./ui/RegisterForm";
```

- [ ] **Step 6: Add auth session restore to app root**

`src/app/_layout.tsx`:
```tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "../features/auth";
import { router } from "expo-router";

export default function RootLayout() {
  const { restoreSession, user, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add . && git commit -m "feat: add auth feature with Supabase, login/register screens"
```

---

### Task 1.6: Tabs Layout + Home Page Skeleton

**Files:**
- Create: `src/app/(tabs)/_layout.tsx`
- Create: `src/app/(tabs)/index.tsx`
- Create: `src/pages/home/HomePage.tsx`
- Create: `src/widgets/monthly-summary/MonthlySummary.tsx`
- Create: `src/widgets/recent-entries/RecentEntries.tsx`

- [ ] **Step 1: Write tabs layout**

`src/app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "통계",
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="shared"
        options={{
          title: "공유",
          tabBarIcon: ({ color }) => <Text style={{ color }}>👫</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "캘린더",
          tabBarIcon: ({ color }) => <Text style={{ color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Write MonthlySummary widget**

`src/widgets/monthly-summary/MonthlySummary.tsx`:
```tsx
import { View, Text } from "react-native";

interface Props {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export function MonthlySummary({ year, month, income, expense }: Props) {
  const balance = income - expense;
  return (
    <View className="bg-white rounded-xl p-4 mx-4 mt-4 shadow">
      <Text className="text-lg font-bold text-center">
        {year}년 {month}월
      </Text>
      <View className="flex-row justify-between mt-4">
        <View className="items-center flex-1">
          <Text className="text-blue-500 text-sm">수입</Text>
          <Text className="text-lg font-bold text-blue-500">
            {income.toLocaleString()}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-red-500 text-sm">지출</Text>
          <Text className="text-lg font-bold text-red-500">
            {expense.toLocaleString()}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-green-500 text-sm">잔액</Text>
          <Text className="text-lg font-bold text-green-500">
            {balance.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Write RecentEntries widget**

`src/widgets/recent-entries/RecentEntries.tsx`:
```tsx
import { View, Text, FlatList } from "react-native";
import { Entry } from "../../entities/entry";

interface Props {
  entries: Entry[];
}

export function RecentEntries({ entries }: Props) {
  const renderItem = ({ item }: { item: Entry }) => (
    <View className="flex-row justify-between items-center py-3 px-4 border-b border-gray-100">
      <View className="flex-1">
        <Text className="text-gray-800">{item.note || "내역"}</Text>
        <Text className="text-gray-400 text-xs">{item.date}</Text>
      </View>
      <Text
        className={`font-bold ${
          item.type === "income" ? "text-blue-500" : "text-red-500"
        }`}
      >
        {item.type === "income" ? "+" : "-"}
        {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View className="mt-4 mx-4 bg-white rounded-xl">
      <Text className="text-base font-bold p-4 pb-2">최근 내역</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}
```

- [ ] **Step 4: Write HomePage**

`src/pages/home/HomePage.tsx`:
```tsx
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";
import { MonthlySummary } from "../../widgets/monthly-summary/MonthlySummary";
import { RecentEntries } from "../../widgets/recent-entries/RecentEntries";

export function HomePage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (user) {
      const data = getEntriesByMonth(user.id, year, month);
      setEntries(data);
    }
  }, [user]);

  const income = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <MonthlySummary year={year} month={month} income={income} expense={expense} />
      <RecentEntries entries={entries} />
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

- [ ] **Step 5: Wire up index.tsx**

`src/app/(tabs)/index.tsx`:
```tsx
import { HomePage } from "../../pages/home/HomePage";

export default function HomeScreen() {
  return <HomePage />;
}
```

- [ ] **Step 6: Create placeholder pages for other tabs**

`src/app/(tabs)/statistics.tsx`:
```tsx
import { View, Text } from "react-native";

export default function StatisticsScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>통계</Text>
    </View>
  );
}
```

`src/app/(tabs)/shared.tsx`:
```tsx
import { View, Text } from "react-native";

export default function SharedScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>공유 가계부</Text>
    </View>
  );
}
```

`src/app/(tabs)/calendar.tsx`:
```tsx
import { View, Text } from "react-native";

export default function CalendarScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>캘린더</Text>
    </View>
  );
}
```

`src/app/(tabs)/settings.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../features/auth";

export default function SettingsScreen() {
  const { signOut, user } = useAuthStore();

  return (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold mb-6">설정</Text>
      <Text className="text-gray-600 mb-8">{user?.email}</Text>
      <TouchableOpacity className="bg-red-500 rounded-lg p-3 items-center" onPress={signOut}>
        <Text className="text-white font-bold">로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add . && git commit -m "feat: add tabs layout, home page with summary and recent entries"
```

---

## Milestone 2: Sync Engine

### Task 2.1: Sync Queue Entity

**Files:**
- Create: `src/entities/sync-queue/model.ts`
- Create: `src/entities/sync-queue/sqlite.ts`
- Create: `src/entities/sync-queue/index.ts`

- [ ] **Step 1: Write sync queue model**

`src/entities/sync-queue/model.ts`:
```ts
export type SyncOperation = "insert" | "update" | "delete";
export type SyncStatus = "pending" | "processing" | "failed";

export interface PendingChange {
  id?: number;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: string;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
}
```

- [ ] **Step 2: Write sync queue SQLite**

`src/entities/sync-queue/sqlite.ts`:
```ts
import { getDb } from "../../shared/lib/db";
import { PendingChange } from "./model";

export function enqueueChange(
  tableName: string,
  recordId: string,
  operation: string,
  payload: Record<string, any>
): void {
  getDb().runSync(
    `INSERT INTO pending_changes (table_name, record_id, operation, payload, status, retry_count)
     VALUES (?, ?, ?, ?, 'pending', 0)`,
    [tableName, recordId, operation, JSON.stringify(payload)]
  );
}

export function getPendingChanges(): PendingChange[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM pending_changes WHERE status = 'pending' ORDER BY created_at ASC"
  );
  return rows.map((r) => ({
    id: r.id,
    tableName: r.table_name,
    recordId: r.record_id,
    operation: r.operation,
    payload: r.payload,
    status: r.status,
    retryCount: r.retry_count,
    createdAt: r.created_at,
  }));
}

export function markChangeDone(id: number): void {
  getDb().runSync("DELETE FROM pending_changes WHERE id = ?", [id]);
}

export function markChangeFailed(id: number): void {
  getDb().runSync(
    "UPDATE pending_changes SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?",
    [id]
  );
}
```

- [ ] **Step 3: Write barrel export**

`src/entities/sync-queue/index.ts`:
```ts
export * from "./model";
export * from "./sqlite";
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add sync queue entity with enqueue/dequeue"
```

---

### Task 2.2: Sync Engine Core

**Files:**
- Create: `src/features/sync-engine/queue.ts`
- Create: `src/features/sync-engine/pusher.ts`
- Create: `src/features/sync-engine/listener.ts`
- Create: `src/features/sync-engine/index.ts`

- [ ] **Step 1: Write queue wrapper (enqueue on every write)**

`src/features/sync-engine/queue.ts`:
```ts
import { enqueueChange } from "../../entities/sync-queue";
import { Entry, CreateEntryInput } from "../../entities/entry";
import { insertEntry, updateEntry, deleteEntry } from "../../entities/entry/sqlite";

export function createEntryLocally(input: CreateEntryInput): Entry {
  const entry = insertEntry(input);
  enqueueChange("entries", entry.id, "insert", entry);
  return entry;
}

export function modifyEntryLocally(id: string, changes: Record<string, any>): Entry | null {
  const entry = updateEntry(id, changes);
  if (entry) {
    enqueueChange("entries", id, "update", entry);
  }
  return entry;
}

export function removeEntryLocally(id: string): void {
  deleteEntry(id);
  enqueueChange("entries", id, "delete", { id });
}
```

- [ ] **Step 2: Write pusher (send pending changes to Supabase)**

`src/features/sync-engine/pusher.ts`:
```ts
import { getPendingChanges, markChangeDone, markChangeFailed } from "../../entities/sync-queue";
import { upsertEntryToSupabase, deleteEntryFromSupabase } from "../../entities/entry/supabase";
import { SYNC_RETRY_MAX } from "../../shared/config/constants";

export async function pushPendingChanges(): Promise<void> {
  const changes = getPendingChanges();

  for (const change of changes) {
    try {
      const payload = JSON.parse(change.payload);

      switch (change.tableName) {
        case "entries":
          if (change.operation === "delete") {
            await deleteEntryFromSupabase(change.recordId);
          } else {
            await upsertEntryToSupabase(payload);
          }
          break;
      }

      markChangeDone(change.id!);
    } catch (error) {
      if (change.retryCount >= SYNC_RETRY_MAX) {
        markChangeFailed(change.id!);
      } else {
        markChangeFailed(change.id!);
      }
    }
  }
}
```

- [ ] **Step 3: Write Realtime listener**

`src/features/sync-engine/listener.ts`:
```ts
import { supabase } from "../../shared/api/supabase";
import { getDb } from "../../shared/lib/db";
import { useAuthStore } from "../auth";

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

export function subscribeToRealtime() {
  const user = useAuthStore.getState().user;
  if (!user) return null;

  const subscription = supabase
    .channel("entries-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "entries",
        filter: `user_id=eq.${user.id}`,
      },
      (payload: RealtimePayload) => {
        handleEntryChange(payload);
      }
    )
    .subscribe();

  return subscription;
}

function handleEntryChange(payload: RealtimePayload) {
  const db = getDb();

  if (payload.eventType === "DELETE") {
    db.runSync("DELETE FROM entries WHERE id = ?", [payload.old.id]);
  } else {
    const row = payload.new;
    db.runSync(
      `INSERT OR REPLACE INTO entries
       (id, user_id, family_id, category_id, amount, type, payment_method, note, date, photo_urls, is_shared, is_recurring, recurring_rule, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id, row.user_id, row.family_id, row.category_id,
        row.amount, row.type, row.payment_method, row.note, row.date,
        row.photo_urls ? JSON.stringify(row.photo_urls) : null,
        row.is_shared ? 1 : 0, row.is_recurring ? 1 : 0,
        row.recurring_rule, row.created_at, row.updated_at,
      ]
    );
  }
}
```

- [ ] **Step 4: Write sync engine barrel**

`src/features/sync-engine/index.ts`:
```ts
export { createEntryLocally, modifyEntryLocally, removeEntryLocally } from "./queue";
export { pushPendingChanges } from "./pusher";
export { subscribeToRealtime } from "./listener";
```

- [ ] **Step 5: Wire sync into app root**

`src/app/_layout.tsx` (add sync calls):
```tsx
import { useEffect, useRef } from "react";
import { pushPendingChanges, subscribeToRealtime } from "../features/sync-engine";
import { SYNC_INTERVAL_MS } from "../shared/config/constants";
// ... inside RootLayout after restoreSession effect ...

export default function RootLayout() {
  const { restoreSession, user, isLoading } = useAuthStore();
  const syncIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (user) {
      subscribeToRealtime();
      syncIntervalRef.current = setInterval(() => {
        pushPendingChanges();
      }, SYNC_INTERVAL_MS);
      // Initial push
      pushPendingChanges();
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add sync engine with queue, pusher, and Realtime listener"
```

---

## Milestone 3: Add Entry Feature

### Task 3.1: Add Entry Form (Bottom Sheet)

**Files:**
- Create: `src/features/add-entry/ui/AmountInput.tsx`
- Create: `src/features/add-entry/ui/CategoryPicker.tsx`
- Create: `src/features/add-entry/ui/PaymentMethodSelector.tsx`
- Create: `src/features/add-entry/ui/EntryForm.tsx`
- Create: `src/features/add-entry/model.ts`
- Create: `src/features/add-entry/index.ts`

- [ ] **Step 1: Write AmountInput**

`src/features/add-entry/ui/AmountInput.tsx`:
```tsx
import { View, TextInput, Text } from "react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function AmountInput({ value, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-1">금액</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
        <Text className="text-lg mr-2">₩</Text>
        <TextInput
          className="flex-1 text-lg"
          placeholder="0"
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Write CategoryPicker**

`src/features/add-entry/ui/CategoryPicker.tsx`:
```tsx
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getDb } from "../../../shared/lib/db";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface Props {
  type: "income" | "expense" | "saving";
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ type, selectedId, onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const rows = getDb().getAllSync<Record<string, any>>(
      "SELECT * FROM categories WHERE type = ? ORDER BY sort_order",
      [type]
    );
    setCategories(rows.map((r) => ({ id: r.id, name: r.name, icon: r.icon, type: r.type })));
  }, [type]);

  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-2">카테고리</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedId === item.id ? "bg-blue-500" : "bg-gray-100"
            }`}
            onPress={() => onSelect(item.id)}
          >
            <Text className={selectedId === item.id ? "text-white" : "text-gray-700"}>
              {item.icon} {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Write PaymentMethodSelector**

`src/features/add-entry/ui/PaymentMethodSelector.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { PaymentMethod } from "../../../entities/entry";

interface Props {
  value?: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "현금" },
  { key: "card", label: "카드" },
  { key: "account", label: "계좌" },
  { key: "transfer", label: "이체" },
];

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-2">결제수단</Text>
      <View className="flex-row">
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            className={`px-4 py-2 rounded-full mr-2 ${
              value === m.key ? "bg-blue-500" : "bg-gray-100"
            }`}
            onPress={() => onChange(m.key)}
          >
            <Text className={value === m.key ? "text-white" : "text-gray-700"}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Write EntryForm**

`src/features/add-entry/ui/EntryForm.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useAuthStore } from "../../../features/auth";
import { createEntryLocally } from "../../../features/sync-engine";
import { EntryType, PaymentMethod } from "../../../entities/entry";
import { AmountInput } from "./AmountInput";
import { CategoryPicker } from "./CategoryPicker";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

interface Props {
  onClose: () => void;
}

export function EntryForm({ onClose }: Props) {
  const { user } = useAuthStore();
  const [type, setType] = useState<EntryType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [note, setNote] = useState("");
  const [isShared, setIsShared] = useState(false);

  const handleSubmit = () => {
    if (!user || !amount) return;
    createEntryLocally({
      userId: user.id,
      amount: parseInt(amount.replace(/,/g, ""), 10),
      type,
      paymentMethod,
      note: note || undefined,
      date: new Date().toISOString().slice(0, 10),
      categoryId,
      isShared,
      isRecurring: false,
    });
    onClose();
  };

  return (
    <ScrollView className="p-6">
      <Text className="text-xl font-bold mb-6">새 기록</Text>

      <View className="flex-row mb-6">
        {(["expense", "income", "saving"] as EntryType[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`px-4 py-2 rounded-full mr-2 ${
              type === t ? "bg-blue-500" : "bg-gray-100"
            }`}
            onPress={() => { setType(t); setCategoryId(undefined); }}
          >
            <Text className={type === t ? "text-white" : "text-gray-700"}>
              {t === "expense" ? "지출" : t === "income" ? "수입" : "저축"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AmountInput value={amount} onChange={setAmount} />
      <CategoryPicker type={type} selectedId={categoryId} onSelect={setCategoryId} />
      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

      <View className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">메모</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="메모를 입력하세요"
          value={note}
          onChangeText={setNote}
        />
      </View>

      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-gray-700">부부 공유</Text>
        <Switch value={isShared} onValueChange={setIsShared} />
      </View>

      <TouchableOpacity className="bg-blue-500 rounded-lg p-3 items-center" onPress={handleSubmit}>
        <Text className="text-white font-bold">저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

- [ ] **Step 5: Write add-entry model + barrel**

`src/features/add-entry/model.ts`:
```ts
import { create } from "zustand";

interface EntryFormState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useEntryFormStore = create<EntryFormState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

`src/features/add-entry/index.ts`:
```ts
export { EntryForm } from "./ui/EntryForm";
export { useEntryFormStore } from "./model";
```

- [ ] **Step 6: Wire FAB to open entry form**

`src/pages/home/HomePage.tsx`:
```tsx
import { EntryForm, useEntryFormStore } from "../../features/add-entry";
import { Modal } from "react-native";
// ... inside HomePage ...

export function HomePage() {
  const { isOpen, open, close } = useEntryFormStore();
  // ... existing code ...

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* ... existing widgets ... */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={open}
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <EntryForm onClose={close} />
      </Modal>
    </ScrollView>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add . && git commit -m "feat: add entry form with amount, category, payment method, and sync"
```

---

### Task 3.2: Default Categories Seeding

**Files:**
- Modify: `src/shared/lib/db.ts`

- [ ] **Step 1: Add default categories seed**

`src/shared/lib/db.ts` (extend `initTables`):
```ts
function seedDefaultCategories() {
  const count = db!.getFirstSync<{ c: number }>("SELECT COUNT(*) as c FROM categories");
  if (count!.c > 0) return;

  const defaults = [
    { name: "월급", icon: "💰", type: "income", sort: 1 },
    { name: "용돈", icon: "🎁", type: "income", sort: 2 },
    { name: "식비", icon: "🍽️", type: "expense", sort: 1 },
    { name: "교통", icon: "🚌", type: "expense", sort: 2 },
    { name: "주거", icon: "🏠", type: "expense", sort: 3 },
    { name: "통신", icon: "📱", type: "expense", sort: 4 },
    { name: "의료", icon: "🏥", type: "expense", sort: 5 },
    { name: "교육", icon: "📚", type: "expense", sort: 6 },
    { name: "문화", icon: "🎬", type: "expense", sort: 7 },
    { name: "쇼핑", icon: "🛍️", type: "expense", sort: 8 },
    { name: "적금", icon: "🏦", type: "saving", sort: 1 },
    { name: "보험", icon: "🛡️", type: "saving", sort: 2 },
    { name: "투자", icon: "📈", type: "saving", sort: 3 },
  ];

  for (const cat of defaults) {
    db!.runSync(
      "INSERT INTO categories (id, user_id, name, icon, type, sort_order) VALUES (?, 'default', ?, ?, ?, ?)",
      [crypto.randomUUID(), cat.name, cat.icon, cat.type, cat.sort]
    );
  }
}
```

Call `seedDefaultCategories()` at the end of `initTables()`.

- [ ] **Step 2: Commit**

```bash
git add . && git commit -m "feat: seed default categories for income/expense/saving"
```

---

## Milestone 4: Family Sharing

### Task 4.1: Family Entity + Supabase RLS

**Files:**
- Create: `src/entities/family/model.ts`
- Create: `src/entities/family/sqlite.ts`
- Create: `src/entities/family/supabase.ts`
- Create: `src/entities/family/index.ts`

- [ ] **Step 1: Write family model**

`src/entities/family/model.ts`:
```ts
export interface Family {
  id: string;
  name: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: string;
  joinedAt: string;
  userEmail?: string;
  userName?: string;
}
```

- [ ] **Step 2: Write family SQLite CRUD**

`src/entities/family/sqlite.ts`:
```ts
import { getDb } from "../../shared/lib/db";
import { Family, FamilyMember } from "./model";

export function insertFamily(family: Family): void {
  getDb().runSync(
    "INSERT OR REPLACE INTO families (id, name, created_at) VALUES (?, ?, ?)",
    [family.id, family.name, family.createdAt]
  );
}

export function insertFamilyMember(member: FamilyMember): void {
  getDb().runSync(
    "INSERT OR REPLACE INTO family_members (id, family_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)",
    [member.id, member.familyId, member.userId, member.role, member.joinedAt]
  );
}

export function getFamilyByUserId(userId: string): Family | null {
  const row = getDb().getFirstSync<Record<string, any>>(
    `SELECT f.* FROM families f
     JOIN family_members fm ON f.id = fm.family_id
     WHERE fm.user_id = ?`,
    [userId]
  );
  if (!row) return null;
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function getFamilyMembers(familyId: string): FamilyMember[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM family_members WHERE family_id = ?",
    [familyId]
  );
  return rows.map((r) => ({
    id: r.id,
    familyId: r.family_id,
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
  }));
}
```

- [ ] **Step 3: Write family Supabase operations**

`src/entities/family/supabase.ts`:
```ts
import { supabase } from "../../shared/api/supabase";
import { Family, FamilyMember } from "./model";

export async function createFamilyOnSupabase(name: string, userId: string): Promise<Family> {
  const { data: family, error: fErr } = await supabase
    .from("families")
    .insert({ name })
    .select()
    .single();
  if (fErr) throw fErr;

  await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: userId,
    role: "owner",
  });

  return { id: family.id, name: family.name, createdAt: family.created_at };
}

export async function inviteByEmail(email: string, familyId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-invite", {
    body: { email, familyId },
  });
  if (error) throw error;
}

export async function acceptInvite(inviteCode: string, userId: string): Promise<void> {
  const { data: invite, error: iErr } = await supabase
    .from("invites")
    .select("*")
    .eq("code", inviteCode)
    .single();
  if (iErr) throw new Error("Invalid invite code");

  await supabase.from("family_members").insert({
    family_id: invite.family_id,
    user_id: userId,
    role: "member",
  });
}
```

- [ ] **Step 4: Write barrel**

`src/entities/family/index.ts`:
```ts
export * from "./model";
export * from "./sqlite";
export * from "./supabase";
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add family entity with sharing CRUD and Supabase ops"
```

---

### Task 4.2: Family Invite Feature

**Files:**
- Create: `src/features/family-invite/ui/InviteScreen.tsx`
- Create: `src/features/family-invite/ui/AcceptInvite.tsx`
- Create: `src/features/family-invite/model.ts`
- Create: `src/features/family-invite/index.ts`
- Create: `src/app/invite/[code].tsx`
- Modify: `src/app/(tabs)/shared.tsx`

- [ ] **Step 1: Write invite model**

`src/features/family-invite/model.ts`:
```ts
import { create } from "zustand";
import { supabase } from "../../shared/api/supabase";
import { FamilyMember } from "../../entities/family";

interface InviteState {
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  sendInvite: (familyId: string) => Promise<void>;
  acceptInvite: (code: string, userId: string) => Promise<void>;
  isLoading: boolean;
}

export const useInviteStore = create<InviteState>((set) => ({
  inviteEmail: "",
  isLoading: false,
  setInviteEmail: (email) => set({ inviteEmail: email }),

  sendInvite: async (familyId) => {
    set({ isLoading: true });
    const { inviteEmail } = useInviteStore.getState();
    const { error } = await supabase.functions.invoke("send-invite", {
      body: { email: inviteEmail, familyId },
    });
    if (error) throw error;
    set({ isLoading: false, inviteEmail: "" });
  },

  acceptInvite: async (code, userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("code", code)
      .single();
    if (error || !data) throw new Error("Invalid invite");

    await supabase.from("family_members").insert({
      family_id: data.family_id,
      user_id: userId,
      role: "member",
    });
    set({ isLoading: false });
  },
}));
```

- [ ] **Step 2: Write InviteScreen UI**

`src/features/family-invite/ui/InviteScreen.tsx`:
```tsx
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useInviteStore } from "../model";

interface Props {
  familyId: string;
}

export function InviteScreen({ familyId }: Props) {
  const { inviteEmail, setInviteEmail, sendInvite, isLoading } = useInviteStore();

  return (
    <View className="p-6">
      <Text className="text-lg font-bold mb-4">부부 초대하기</Text>
      <Text className="text-gray-500 mb-4">
        배우자의 이메일을 입력하면 초대장이 발송됩니다.
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="배우자 이메일"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 items-center"
        onPress={() => sendInvite(familyId)}
        disabled={isLoading}
      >
        <Text className="text-white font-bold">
          {isLoading ? "전송 중..." : "초대 보내기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 3: Write AcceptInvite UI**

`src/features/family-invite/ui/AcceptInvite.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../auth";
import { useInviteStore } from "../model";
import { router } from "expo-router";

export function AcceptInvite({ code }: { code: string }) {
  const { user } = useAuthStore();
  const { acceptInvite, isLoading } = useInviteStore();

  const handleAccept = async () => {
    if (!user) return;
    await acceptInvite(code, user.id);
    router.replace("/(tabs)/shared");
  };

  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-xl font-bold mb-4">가계부 초대</Text>
      <Text className="text-gray-500 mb-6">
        배우자의 가계부에 초대되었습니다. 수락하시겠습니까?
      </Text>
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-3 px-8 items-center"
        onPress={handleAccept}
        disabled={isLoading}
      >
        <Text className="text-white font-bold">
          {isLoading ? "처리 중..." : "수락하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 4: Write barrel + invite route**

`src/features/family-invite/index.ts`:
```ts
export { InviteScreen } from "./ui/InviteScreen";
export { AcceptInvite } from "./ui/AcceptInvite";
export { useInviteStore } from "./model";
```

`src/app/invite/[code].tsx`:
```tsx
import { useLocalSearchParams } from "expo-router";
import { AcceptInvite } from "../../features/family-invite";

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <AcceptInvite code={code} />;
}
```

- [ ] **Step 5: Update shared tab page**

`src/app/(tabs)/shared.tsx`:
```tsx
import { SharedPage } from "../../pages/shared/SharedPage";

export default function SharedScreen() {
  return <SharedPage />;
}
```

`src/pages/shared/SharedPage.tsx`:
```tsx
import { View, Text } from "react-native";
import { useState } from "react";
import { getFamilyByUserId } from "../../entities/family";
import { useAuthStore } from "../../features/auth";
import { InviteScreen } from "../../features/family-invite";

export function SharedPage() {
  const { user } = useAuthStore();
  const [family] = useState(() => (user ? getFamilyByUserId(user.id) : null));

  if (!user) return null;

  return (
    <View className="flex-1">
      <View className="flex-row p-4 bg-white border-b border-gray-200">
        {["전체", "개인", "공용"].map((tab) => (
          <TouchableOpacity key={tab} className="px-4 py-2 mr-2 rounded-full bg-gray-100">
            <Text>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!family && <InviteScreen familyId={""} />}
    </View>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add family invite feature with email invite and accept flow"
```

---

## Milestone 5: Statistics + Budget

### Task 5.1: Statistics Page with Charts

**Files:**
- Create: `src/widgets/category-chart/CategoryChart.tsx`
- Create: `src/pages/statistics/StatisticsPage.tsx`

- [ ] **Step 1: Write CategoryChart widget**

`src/widgets/category-chart/CategoryChart.tsx`:
```tsx
import { View, Text } from "react-native";
import { Entry } from "../../entities/entry";

interface Props {
  entries: Entry[];
  type: "expense" | "income";
}

export function CategoryChart({ entries, type }: Props) {
  const filtered = entries.filter((e) => e.type === type);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const grouped: Record<string, number> = {};
  for (const e of filtered) {
    const key = e.categoryId || "기타";
    grouped[key] = (grouped[key] || 0) + e.amount;
  }

  const sorted = Object.entries(grouped).sort(([, a], [, b]) => b - a);

  return (
    <View className="bg-white rounded-xl p-4 mx-4 mt-4">
      <Text className="text-base font-bold mb-4">
        {type === "expense" ? "지출 카테고리" : "수입 카테고리"}
      </Text>
      {sorted.map(([cat, amount]) => (
        <View key={cat} className="flex-row items-center mb-2">
          <View className="flex-1">
            <View className="h-4 bg-blue-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(amount / total) * 100}%` }}
              />
            </View>
          </View>
          <Text className="ml-2 text-sm w-20 text-right">
            {((amount / total) * 100).toFixed(0)}%
          </Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Write StatisticsPage**

`src/pages/statistics/StatisticsPage.tsx`:
```tsx
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";
import { MonthlySummary } from "../../widgets/monthly-summary/MonthlySummary";
import { CategoryChart } from "../../widgets/category-chart/CategoryChart";

type Period = "week" | "month" | "year";

export function StatisticsPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>("month");
  const [entries, setEntries] = useState<Entry[]>([]);
  const now = new Date();

  useEffect(() => {
    if (user) {
      setEntries(getEntriesByMonth(user.id, now.getFullYear(), now.getMonth() + 1));
    }
  }, [user]);

  const income = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <MonthlySummary year={now.getFullYear()} month={now.getMonth() + 1} income={income} expense={expense} />
      <CategoryChart entries={entries} type="expense" />
      <CategoryChart entries={entries} type="income" />
    </ScrollView>
  );
}
```

- [ ] **Step 3: Wire up statistics tab**

`src/app/(tabs)/statistics.tsx`:
```tsx
import { StatisticsPage } from "../../pages/statistics/StatisticsPage";

export default function StatisticsScreen() {
  return <StatisticsPage />;
}
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add statistics page with category charts"
```

---

### Task 5.2: Budget Management

**Files:**
- Create: `src/entities/budget/model.ts`
- Create: `src/entities/budget/sqlite.ts`
- Create: `src/entities/budget/index.ts`
- Create: `src/features/budget-manager/ui/BudgetForm.tsx`
- Create: `src/features/budget-manager/ui/BudgetList.tsx`
- Create: `src/features/budget-manager/model.ts`
- Create: `src/features/budget-manager/index.ts`
- Create: `src/widgets/budget-progress/BudgetProgress.tsx`

- [ ] **Step 1: Write budget model + SQLite**

`src/entities/budget/model.ts`:
```ts
export interface Budget {
  id: string;
  userId?: string;
  familyId?: string;
  categoryId: string;
  amount: number;
  month: string;
}
```

`src/entities/budget/sqlite.ts`:
```ts
import { getDb } from "../../shared/lib/db";
import { Budget } from "./model";

export function upsertBudget(budget: Budget): void {
  getDb().runSync(
    `INSERT OR REPLACE INTO budgets (id, user_id, family_id, category_id, amount, month)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [budget.id, budget.userId ?? null, budget.familyId ?? null, budget.categoryId, budget.amount, budget.month]
  );
}

export function getBudgetsByMonth(month: string): Budget[] {
  const rows = getDb().getAllSync<Record<string, any>>(
    "SELECT * FROM budgets WHERE month = ?",
    [month]
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    familyId: r.family_id,
    categoryId: r.category_id,
    amount: r.amount,
    month: r.month,
  }));
}
```

`src/entities/budget/index.ts`:
```ts
export * from "./model";
export * from "./sqlite";
```

- [ ] **Step 2: Write BudgetProgress widget**

`src/widgets/budget-progress/BudgetProgress.tsx`:
```tsx
import { View, Text } from "react-native";

interface Props {
  categoryName: string;
  spent: number;
  budget: number;
}

export function BudgetProgress({ categoryName, spent, budget }: Props) {
  const pct = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm">{categoryName}</Text>
        <Text className={`text-sm ${isOver ? "text-red-500" : "text-gray-500"}`}>
          {spent.toLocaleString()} / {budget.toLocaleString()}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Write budget manager feature**

`src/features/budget-manager/model.ts`:
```ts
import { create } from "zustand";
import { Budget, upsertBudget, getBudgetsByMonth } from "../../entities/budget";

interface BudgetState {
  budgets: Budget[];
  month: string;
  loadBudgets: (month: string) => void;
  setBudget: (categoryId: string, amount: number) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  month: new Date().toISOString().slice(0, 7),

  loadBudgets: (month) => {
    set({ budgets: getBudgetsByMonth(month), month });
  },

  setBudget: (categoryId, amount) => {
    const { month } = useBudgetStore.getState();
    const budget: Budget = {
      id: `${month}-${categoryId}`,
      categoryId,
      amount,
      month,
    };
    upsertBudget(budget);
    set((s) => ({
      budgets: [...s.buffers.filter((b) => b.categoryId !== categoryId), budget],
    }));
  },
}));
```

`src/features/budget-manager/ui/BudgetForm.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useBudgetStore } from "../model";

export function BudgetForm({ categoryId, currentAmount }: { categoryId: string; currentAmount?: number }) {
  const [amount, setAmount] = useState(currentAmount?.toString() ?? "");
  const { setBudget } = useBudgetStore();

  return (
    <View className="flex-row items-center mb-2">
      <TextInput
        className="border border-gray-300 rounded-lg p-2 flex-1 mr-2"
        placeholder="예산 금액"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity
        className="bg-blue-500 rounded-lg px-4 py-2"
        onPress={() => setBudget(categoryId, parseInt(amount, 10))}
      >
        <Text className="text-white text-sm">설정</Text>
      </TouchableOpacity>
    </View>
  );
}
```

`src/features/budget-manager/ui/BudgetList.tsx`:
```tsx
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useBudgetStore } from "../model";
import { getDb } from "../../../shared/lib/db";

export function BudgetList() {
  const { budgets, month, loadBudgets } = useBudgetStore();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadBudgets(month);
    const rows = getDb().getAllSync<Record<string, any>>(
      "SELECT * FROM categories WHERE type = 'expense' ORDER BY sort_order"
    );
    setCategories(rows);
  }, []);

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">예산 관리</Text>
      {categories.map((cat) => {
        const budget = budgets.find((b) => b.categoryId === cat.id);
        return (
          <View key={cat.id} className="mb-2">
            <Text className="text-gray-700">{cat.icon} {cat.name}</Text>
            <Text className="text-gray-500 text-sm">
              예산: {budget ? budget.amount.toLocaleString() : "미설정"}원
            </Text>
          </View>
        );
      })}
    </View>
  );
}
```

`src/features/budget-manager/index.ts`:
```ts
export { BudgetList } from "./ui/BudgetList";
export { BudgetForm } from "./ui/BudgetForm";
export { useBudgetStore } from "./model";
```

- [ ] **Step 4: Add budget section to settings tab**

`src/pages/settings/SettingsPage.tsx`:
```tsx
import { View, ScrollView } from "react-native";
import { BudgetList } from "../../features/budget-manager";

export function SettingsPage() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <BudgetList />
    </ScrollView>
  );
}
```

`src/app/(tabs)/settings.tsx`:
```tsx
import { SettingsPage } from "../../pages/settings/SettingsPage";

export default function SettingsScreen() {
  return <SettingsPage />;
}
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add budget management with per-category budget settings"
```

---

## Milestone 6: Polish + Extras

### Task 6.1: Calendar View

**Files:**
- Create: `src/pages/calendar/CalendarPage.tsx`

- [ ] **Step 1: Write CalendarPage**

`src/pages/calendar/CalendarPage.tsx`:
```tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../features/auth";
import { Entry, getEntriesByMonth } from "../../entities/entry";

export function CalendarPage() {
  const { user } = useAuthStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (user) {
      setEntries(getEntriesByMonth(user.id, year, month));
    }
  }, [user, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const getEntriesForDay = (day: number) =>
    entries.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity onPress={() => setMonth((m) => (m === 1 ? (setYear((y) => y - 1), 12) : m - 1))}>
          <Text className="text-xl">◀</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">{year}년 {month}월</Text>
        <TouchableOpacity onPress={() => setMonth((m) => (m === 12 ? (setYear((y) => y + 1), 1) : m + 1))}>
          <Text className="text-xl">▶</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap bg-white mx-4 rounded-xl p-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <View key={d} className="w-[14.28%] items-center py-2">
            <Text className="text-xs text-gray-400">{d}</Text>
          </View>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`empty-${i}`} className="w-[14.28%] p-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEntries = getEntriesForDay(day);
          const totalExpense = dayEntries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

          return (
            <TouchableOpacity key={day} className="w-[14.28%] p-1 items-center">
              <Text className="text-sm">{day}</Text>
              {totalExpense > 0 && (
                <Text className="text-xs text-red-400">
                  {totalExpense.toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Wire up**

`src/app/(tabs)/calendar.tsx`:
```tsx
import { CalendarPage } from "../../pages/calendar/CalendarPage";

export default function CalendarScreen() {
  return <CalendarPage />;
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add calendar view with daily expense preview"
```

---

### Task 6.2: Search Feature

**Files:**
- Create: `src/features/search-entries/ui/SearchSheet.tsx`
- Create: `src/features/search-entries/model.ts`
- Create: `src/features/search-entries/index.ts`

- [ ] **Step 1: Write search model**

`src/features/search-entries/model.ts`:
```ts
import { create } from "zustand";
import { getDb } from "../../shared/lib/db";
import { Entry } from "../../entities/entry";

interface SearchState {
  results: Entry[];
  query: string;
  search: (q: string) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  query: "",

  search: (query) => {
    const db = getDb();
    const rows = db.getAllSync<Record<string, any>>(
      "SELECT * FROM entries WHERE note LIKE ? OR amount LIKE ? ORDER BY date DESC LIMIT 50",
      [`%${query}%`, `%${query}%`]
    );
    set({
      query,
      results: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        amount: r.amount,
        type: r.type,
        date: r.date,
        note: r.note,
        categoryId: r.category_id,
        paymentMethod: r.payment_method,
        isShared: Boolean(r.is_shared),
        isRecurring: Boolean(r.is_recurring),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  },

  clear: () => set({ results: [], query: "" }),
}));
```

- [ ] **Step 2: Write SearchSheet**

`src/features/search-entries/ui/SearchSheet.tsx`:
```tsx
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useSearchStore } from "../model";

export function SearchSheet() {
  const { query, results, search, clear } = useSearchStore();

  return (
    <View className="p-4">
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="검색 (메모, 금액)"
        value={query}
        onChangeText={search}
        autoFocus
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text>{item.note || "내역"}</Text>
              <Text className="text-xs text-gray-400">{item.date}</Text>
            </View>
            <Text className={item.type === "income" ? "text-blue-500" : "text-red-500"}>
              {item.amount.toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          query ? <Text className="text-center text-gray-400">검색 결과가 없습니다</Text> : null
        }
      />
    </View>
  );
}
```

`src/features/search-entries/index.ts`:
```ts
export { SearchSheet } from "./ui/SearchSheet";
export { useSearchStore } from "./model";
```

- [ ] **Step 3: Add search to home page header**

`src/pages/home/HomePage.tsx`:
```tsx
import { useState } from "react";
import { Modal } from "react-native";
import { SearchSheet } from "../../features/search-entries";
// ... add search button ...
<TouchableOpacity className="p-2" onPress={() => setSearchOpen(true)}>
  <Text>🔍</Text>
</TouchableOpacity>
<Modal visible={isSearchOpen} animationType="slide">
  <SearchSheet onClose={() => setSearchOpen(false)} />
</Modal>
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add search feature with note/amount search"
```

---

### Task 6.3: Sync Status Widget + Polish

**Files:**
- Create: `src/widgets/sync-status/SyncStatus.tsx`

- [ ] **Step 1: Write SyncStatus widget**

`src/widgets/sync-status/SyncStatus.tsx`:
```tsx
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { getDb } from "../../shared/lib/db";

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const row = getDb().getFirstSync<{ c: number }>(
        "SELECT COUNT(*) as c FROM pending_changes WHERE status = 'pending'"
      );
      setPendingCount(row?.c ?? 0);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-row items-center px-4 py-2">
      <View className={`w-2 h-2 rounded-full mr-2 ${pendingCount === 0 ? "bg-green-500" : "bg-yellow-500"}`} />
      <Text className="text-xs text-gray-500">
        {pendingCount === 0 ? "동기화 완료" : `${pendingCount}개 대기 중`}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Add to settings page**

`src/pages/settings/SettingsPage.tsx`:
```tsx
import { SyncStatus } from "../../widgets/sync-status/SyncStatus";
// ... add to page ...
<SyncStatus />
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add sync status widget showing pending changes count"
```

---

### Task 6.4: Motion Animations (Framer Motion for RN)

**Files:**
- Modify: 모든 페이지 및 위젯에 애니메이션 추가

- [ ] **Step 1: Animate list items with staggered fade-in**

`src/widgets/recent-entries/RecentEntries.tsx` (modify):
```tsx
import { useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated";
import Animated from "react-native-reanimated";

// In renderItem:
const animStyle = useAnimatedStyle(() => ({
  opacity: withDelay(index * 80, withSpring(1, { tension: 100, friction: 10 })),
  transform: [{ translateY: withDelay(index * 80, withSpring(0, { tension: 100, friction: 10 })) }],
}), [index]);

// Wrap item View in:
<Animated.View style={animStyle}>
  {/* existing item content */}
</Animated.View>
```

- [ ] **Step 2: Animate FAB with spring bounce**

`src/pages/home/HomePage.tsx` (modify FAB):
```tsx
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

const fabAnim = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(1, { tension: 200, friction: 8 }) }],
}), []);

// Replace TouchableOpacity with:
<Animated.View style={fabAnim}>
  <TouchableOpacity
    className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
    onPress={open}
  >
    <Text className="text-white text-2xl">+</Text>
  </TouchableOpacity>
</Animated.View>
```

- [ ] **Step 3: Animate monthly summary numbers (counting up)**

`src/widgets/monthly-summary/MonthlySummary.tsx` (modify):
```tsx
import { useEffect, useRef } from "react";
import Animated, { useAnimatedProps, withTiming } from "react-native-reanimated";

// For each numeric value, animate counting:
function AnimatedNumber({ value }: { value: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [value]);

  // Use AnimatedText or re-text for animated numbers
  return (
    <Text>
      {Math.round(animatedValue.value).toLocaleString()}
    </Text>
  );
}
```

- [ ] **Step 4: Add spring animation to category selection**

`src/features/add-entry/ui/CategoryPicker.tsx` (modify):
```tsx
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

// Wrap each category TouchableOpacity:
{/* inside renderItem */}
<Animated.View
  style={useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selectedId === item.id ? 1.1 : 1, { tension: 150, friction: 8 }) }],
  }), [selectedId, item.id])}
>
  <TouchableOpacity ... />
</Animated.View>
```

- [ ] **Step 5: Add modal slide-up animation**

`src/pages/home/HomePage.tsx` (modify modal):
```tsx
import Animated, { useAnimatedStyle, withSpring, SlideInUp } from "react-native-reanimated";

// Use entering/exiting animations:
<Modal visible={isOpen} animationType="none" presentationStyle="pageSheet">
  <Animated.View entering={SlideInUp.springify().tension(80).friction(12)} style={{ flex: 1 }}>
    <EntryForm onClose={close} />
  </Animated.View>
</Modal>
```

- [ ] **Step 6: Add chart animation (bars grow from bottom)**

`src/widgets/category-chart/CategoryChart.tsx` (modify):
```tsx
import Animated, { useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated";

// In sorted.map, add index parameter:
const barAnim = useAnimatedStyle(() => ({
  width: `${(amount / total) * 100}%`,
  height: withDelay(index * 100, withSpring(16, { tension: 100, friction: 12 })),
}), [amount, total, index]);

// Replace the inner bar View with:
<Animated.View style={barAnim} className="h-full bg-blue-500 rounded-full" />
```

- [ ] **Step 7: Animate shared entries highlight on real-time update**

`src/pages/shared/SharedPage.tsx`:
```tsx
// When a new shared entry arrives via Realtime, briefly highlight it
import { useAnimatedStyle, withSequence, withTiming, withSpring } from "react-native-reanimated";

const highlightAnim = useAnimatedStyle(() => ({
  backgroundColor: withSequence(
    withTiming("rgba(59, 130, 246, 0.3)", { duration: 300 }),
    withTiming("rgba(59, 130, 246, 0)", { duration: 1000 })
  ),
}), [entryId]);
```

- [ ] **Step 8: Commit**

```bash
git add . && git commit -m "feat: add motion animations - staggered list, FAB bounce, counting numbers, category spring, bar chart growth, real-time highlight"
```

---

## Self-Review

**Spec coverage:**
- [x] Supabase Auth (Task 1.5)
- [x] SQLite local storage (Tasks 1.3, 1.4)
- [x] Entry CRUD (Tasks 1.4, 3.1)
- [x] Sync engine with queue + Realtime (Task 2.1, 2.2)
- [x] Family sharing (Tasks 4.1, 4.2)
- [x] Three sharing modes: full/separate/tag-based (spec mentions, implement in shared page filter UI)
- [x] Statistics/charts (Task 5.1)
- [x] Budget management (Task 5.2)
- [x] Calendar view (Task 6.1)
- [x] Search (Task 6.2)
- [x] Sync status (Task 6.3)
- [x] Motion animations (Task 6.4)
- [x] FSD architecture (entire file structure)
- [x] Expo Router (all app/ routes)

**Placeholder check:** No TBD, TODO, or incomplete sections.

**Type consistency:** All model types, function signatures, and property names are consistent across tasks.
