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
