import pg from "pg";

const { Pool } = pg;

export const connectionString =
  process.env.DATABASE_URL ||
  "postgres://liga1:liga1_dev_password@127.0.0.1:54329/liga1_analytics";

export const pool = new Pool({ connectionString });

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
