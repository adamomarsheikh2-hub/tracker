import { Pool } from "pg";

let pool;
function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    const needsSsl =
      !!url &&
      !url.includes(".railway.internal") &&
      process.env.NODE_ENV === "production";
    pool = new Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// v2: single `data` JSONB blob — no column migrations needed for future changes.
// New table name (tracker_state_v2) avoids conflicts with the old schema.
let schemaReady;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS tracker_state_v2 (
        id         INT         PRIMARY KEY DEFAULT 1,
        data       JSONB       NOT NULL DEFAULT 'null'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT single_row_v2 CHECK (id = 1)
      );
    `);
  }
  return schemaReady;
}

export async function query(text, params) {
  await ensureSchema();
  return getPool().query(text, params);
}
