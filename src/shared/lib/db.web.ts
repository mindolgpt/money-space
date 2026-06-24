import { generateId } from '@/shared/lib/uuid'

type SQLiteDatabase = {
  execSync: (sql: string) => any[]
  runSync: (sql: string, ...params: any[]) => any
  getAllSync: (sql: string, ...params: any[]) => any[]
  getFirstSync: (sql: string, ...params: any[]) => any
}

const tables = new Set<string>()
const stores = new Map<string, Map<string, any>>()

function normalizeParams(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0]
  }
  return params
}

function extractTableFrom(sql: string): string | null {
  const m = sql.match(/(?:INSERT\s+INTO|FROM|UPDATE|DELETE\s+FROM)\s+(\w+)/i)
  return m ? m[1] : null
}

function extractInsertCols(sql: string): string[] | null {
  const m = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)\s*VALUES/i)
  if (!m) return null
  return m[1].split(',').map((c) => c.trim())
}

const webDb: SQLiteDatabase = {
  execSync(sql: string) {
    const createMatch = sql.match(/CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i)
    if (createMatch) {
      tables.add(createMatch[1])
    }
    const selectMatch = sql.match(
      /SELECT name FROM sqlite_master WHERE type='table' AND name='(\w+)'/i,
    )
    if (selectMatch) {
      return tables.has(selectMatch[1]) ? [{ name: selectMatch[1] }] : []
    }
    return []
  },

  runSync(sql: string, ...params: any[]) {
    const vals = normalizeParams(params)
    const table = extractTableFrom(sql)
    if (!table) return

    if (/^INSERT\s+INTO/i.test(sql)) {
      const cols = extractInsertCols(sql)
      if (!cols) return
      if (!stores.has(table)) stores.set(table, new Map())
      const row: Record<string, any> = {}
      cols.forEach((col, i) => {
        row[col] = vals[i]
      })
      if (!row.id) row.id = generateId()
      stores.get(table)!.set(row.id, row)
    } else if (/^DELETE/i.test(sql)) {
      if (vals.length > 0) {
        stores.get(table)?.delete(vals[0])
      }
    } else if (/^UPDATE/i.test(sql)) {
      const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i)
      if (setMatch && vals.length > 1) {
        const id = vals[vals.length - 1]
        const row = stores.get(table)?.get(id)
        if (row) {
          const assignments = setMatch[1].split(',').map((a) => a.trim())
          const setParams = vals.slice(0, -1)
          assignments.forEach((a, i) => {
            const col = a.split(/\s*=\s*/)[0].trim()
            if (col !== 'updated_at') {
              row[col] = setParams[i]
            }
          })
        }
      }
    }
  },

  getAllSync(sql: string, ...params: any[]) {
    const table = extractTableFrom(sql)
    if (!table) return []
    const rows = stores.get(table)
    if (!rows) return []
    return Array.from(rows.values())
  },

  getFirstSync(sql: string, ...params: any[]) {
    const vals = normalizeParams(params)
    const table = extractTableFrom(sql)
    if (!table) return null

    const countMatch = sql.match(/COUNT\(\*\)\s+as\s+(\w+)/i)
    if (countMatch) {
      const col = countMatch[1]
      const rows = stores.get(table)
      return { [col]: rows ? rows.size : 0 }
    }

    const rows = stores.get(table)
    if (!rows) return null
    if (vals.length > 0) {
      const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i)
      if (idMatch) {
        return rows.get(vals[0]) ?? null
      }
    }
    const all = Array.from(rows.values())
    return all.length ? all[0] : null
  },
}

let db: SQLiteDatabase | null = null

export function getDb(): SQLiteDatabase {
  if (!db) {
    db = webDb
    initTables()
    runMigrations()
  }
  return db
}

function runMigrations() {
  const catColumns = webDb.getAllSync<{ name: string }>(
    "PRAGMA table_info('categories')",
  )
  if (!catColumns.find((c: any) => c.name === 'is_system')) {
    // migration handled by init
  }

  const famColumns = webDb.getAllSync<{ name: string }>(
    "PRAGMA table_info('families')",
  )
  if (!famColumns.find((c: any) => c.name === 'invite_code')) {
    // migration handled by init
  }
}

function initTables() {
  webDb.execSync(`
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
      is_system INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
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

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'light',
      currency TEXT DEFAULT 'KRW',
      language TEXT DEFAULT 'ko',
      notifications TEXT DEFAULT '{}',
      security TEXT DEFAULT '{}',
      sync TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  const count = webDb.getFirstSync<{ c: number }>(
    'SELECT COUNT(*) as c FROM categories',
  )
  if (count!.c > 0) return

  const defaults = [
    { name: '월급', icon: '💰', type: 'income', sort: 1 },
    { name: '용돈', icon: '🎁', type: 'income', sort: 2 },
    { name: '사업수입', icon: '💼', type: 'income', sort: 3 },
    { name: '식비', icon: '🍽️', type: 'expense', sort: 1 },
    { name: '교통', icon: '🚌', type: 'expense', sort: 2 },
    { name: '주거', icon: '🏠', type: 'expense', sort: 3 },
    { name: '통신', icon: '📱', type: 'expense', sort: 4 },
    { name: '의료', icon: '🏥', type: 'expense', sort: 5 },
    { name: '교육', icon: '📚', type: 'expense', sort: 6 },
    { name: '문화', icon: '🎬', type: 'expense', sort: 7 },
    { name: '쇼핑', icon: '🛍️', type: 'expense', sort: 8 },
    { name: '카드대금', icon: '💳', type: 'expense', sort: 9 },
    { name: '보험', icon: '🛡️', type: 'expense', sort: 10 },
    { name: '경조사', icon: '🎊', type: 'expense', sort: 11 },
    { name: '적금', icon: '🏦', type: 'saving', sort: 1 },
    { name: '투자', icon: '📈', type: 'saving', sort: 2 },
    { name: '연금', icon: '👴', type: 'saving', sort: 3 },
  ]

  for (const cat of defaults) {
    webDb.runSync(
      "INSERT INTO categories (id, user_id, name, icon, type, is_system, sort_order) VALUES (?, 'system', ?, ?, ?, 1, ?)",
      [generateId(), cat.name, cat.icon, cat.type, cat.sort],
    )
  }
}
