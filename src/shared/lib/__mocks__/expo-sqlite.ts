interface SQLiteDatabase {
  execSync: (sql: string) => any[];
  runSync: (sql: string, ...params: any[]) => any;
  getAllSync: (sql: string, ...params: any[]) => any[];
  getFirstSync: (sql: string, ...params: any[]) => any;
}

const tables = new Set<string>();
const stores = new Map<string, Map<string, any>>();

function normalizeParams(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

function extractTableFrom(sql: string): string | null {
  const m = sql.match(/(?:INSERT\s+INTO|FROM|UPDATE|DELETE\s+FROM)\s+(\w+)/i);
  return m ? m[1] : null;
}

function extractInsertCols(sql: string): string[] | null {
  const m = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)\s*VALUES/i);
  if (!m) return null;
  return m[1].split(",").map((c) => c.trim());
}

function resetDb(): void {
  tables.clear();
  stores.clear();
}

const mockDb: SQLiteDatabase = {
  execSync: jest.fn().mockImplementation((sql: string) => {
    const createMatch = sql.match(/CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i);
    if (createMatch) {
      tables.add(createMatch[1]);
    }
    const selectMatch = sql.match(
      /SELECT name FROM sqlite_master WHERE type='table' AND name='(\w+)'/i,
    );
    if (selectMatch) {
      return tables.has(selectMatch[1]) ? [{ name: selectMatch[1] }] : [];
    }
    return [];
  }),
  runSync: jest.fn().mockImplementation((sql: string, ...params: any[]) => {
    const vals = normalizeParams(params);
    const table = extractTableFrom(sql);
    if (!table) return;

    if (/^INSERT\s+INTO/i.test(sql)) {
      const cols = extractInsertCols(sql);
      if (!cols) return;
      if (!stores.has(table)) stores.set(table, new Map());
      const row: Record<string, any> = {};
      cols.forEach((col, i) => {
        row[col] = vals[i];
      });
      stores.get(table)!.set(row.id, row);
    } else if (/^DELETE/i.test(sql)) {
      if (vals.length > 0) {
        stores.get(table)?.delete(vals[0]);
      }
    } else if (/^UPDATE/i.test(sql)) {
      const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
      if (setMatch && vals.length > 1) {
        const id = vals[vals.length - 1];
        const row = stores.get(table)?.get(id);
        if (row) {
          const assignments = setMatch[1].split(",").map((a) => a.trim());
          const setParams = vals.slice(0, -1);
          const updatedAtIdx = assignments.findIndex((a) =>
            a.startsWith("updated_at"),
          );
          assignments.forEach((a, i) => {
            const col = a.split(/\s*=\s*/)[0].trim();
            if (col === "updated_at") {
              row[col] = setParams[updatedAtIdx];
            } else {
              row[col] = setParams[i];
            }
          });
        }
      }
    }
  }),
  getAllSync: jest.fn().mockImplementation((sql: string, ...params: any[]) => {
    const table = extractTableFrom(sql);
    if (!table) return [];
    const rows = stores.get(table);
    if (!rows) return [];
    return Array.from(rows.values());
  }),
  getFirstSync: jest.fn().mockImplementation((sql: string, ...params: any[]) => {
    const vals = normalizeParams(params);
    const table = extractTableFrom(sql);
    if (!table) return null;
    const rows = stores.get(table);
    if (!rows) return null;
    if (vals.length > 0) {
      const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
      if (idMatch) {
        return rows.get(vals[0]) ?? null;
      }
    }
    const all = Array.from(rows.values());
    return all.length ? all[0] : null;
  }),
};

let instance: SQLiteDatabase | null = null;

export function openDatabaseSync(_name: string): SQLiteDatabase {
  if (!instance) {
    instance = mockDb;
  }
  return instance;
}

export type { SQLiteDatabase };
export { resetDb };
