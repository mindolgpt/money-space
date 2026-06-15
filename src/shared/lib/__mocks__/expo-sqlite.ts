interface SQLiteDatabase {
  execSync: (sql: string) => any[];
  runSync: (sql: string, ...params: any[]) => any;
  getAllSync: (sql: string, ...params: any[]) => any[];
  getFirstSync: (sql: string, ...params: any[]) => any;
}

const tables = new Set<string>();
const CREATE_RE = /CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i;
const SELECT_MASTER_RE = /SELECT name FROM sqlite_master WHERE type='table' AND name='(\w+)'/i;

const mockDb: SQLiteDatabase = {
  execSync: jest.fn().mockImplementation((sql: string) => {
    const createMatch = sql.match(CREATE_RE);
    if (createMatch) {
      tables.add(createMatch[1]);
    }
    const selectMatch = sql.match(SELECT_MASTER_RE);
    if (selectMatch) {
      return tables.has(selectMatch[1]) ? [{ name: selectMatch[1] }] : [];
    }
    return [];
  }),
  runSync: jest.fn(),
  getAllSync: jest.fn().mockReturnValue([]),
  getFirstSync: jest.fn(),
};

let instance: SQLiteDatabase | null = null;

export function openDatabaseSync(_name: string): SQLiteDatabase {
  if (!instance) {
    instance = mockDb;
  }
  return instance;
}

export type { SQLiteDatabase };
