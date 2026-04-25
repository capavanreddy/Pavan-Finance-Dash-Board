import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazy initialization to avoid build-time errors when DATABASE_URL is not available
let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}
