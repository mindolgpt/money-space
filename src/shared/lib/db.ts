import * as SQLite from "expo-sqlite";
import { DB_NAME } from "../config/constants";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    const instance = SQLite.openDatabaseSync(DB_NAME);
    instance.execSync("PRAGMA foreign_keys = ON");
    initTables(instance);
    db = instance;
  }
  return db;
}

function initTables(database: SQLite.SQLiteDatabase) {
  database.execSync(`
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

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
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
  `);

  seedDefaultCategories(database);
}

function seedDefaultCategories(database: SQLite.SQLiteDatabase) {
  const count = database.getFirstSync<{ c: number }>("SELECT COUNT(*) as c FROM categories");
  if (count!.c > 0) return;

  const defaults = [
    { name: "월급", icon: "💰", type: "income", sort: 1 },
    { name: "용돈", icon: "🎁", type: "income", sort: 2 },
    { name: "사업수입", icon: "💼", type: "income", sort: 3 },
    { name: "식비", icon: "🍽️", type: "expense", sort: 1 },
    { name: "교통", icon: "🚌", type: "expense", sort: 2 },
    { name: "주거", icon: "🏠", type: "expense", sort: 3 },
    { name: "통신", icon: "📱", type: "expense", sort: 4 },
    { name: "의료", icon: "🏥", type: "expense", sort: 5 },
    { name: "교육", icon: "📚", type: "expense", sort: 6 },
    { name: "문화", icon: "🎬", type: "expense", sort: 7 },
    { name: "쇼핑", icon: "🛍️", type: "expense", sort: 8 },
    { name: "카드대금", icon: "💳", type: "expense", sort: 9 },
    { name: "보험", icon: "🛡️", type: "expense", sort: 10 },
    { name: "경조사", icon: "🎊", type: "expense", sort: 11 },
    { name: "적금", icon: "🏦", type: "saving", sort: 1 },
    { name: "투자", icon: "📈", type: "saving", sort: 2 },
    { name: "연금", icon: "👴", type: "saving", sort: 3 },
  ];

  for (const cat of defaults) {
    database.runSync(
      "INSERT INTO categories (id, user_id, name, icon, type, sort_order) VALUES (?, 'default', ?, ?, ?, ?)",
      [crypto.randomUUID(), cat.name, cat.icon, cat.type, cat.sort]
    );
  }
}
