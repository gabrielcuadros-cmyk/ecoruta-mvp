// Acceso a datos: PostgreSQL (Neon) en producción, PGlite embebido en local.
import pg from 'pg';

// Neon agrega channel_binding=require, que el driver pg no necesita: se quita de la URL.
export function dbUrl() {
  const u = new URL(process.env.DATABASE_URL);
  u.searchParams.delete('channel_binding');
  return u.toString();
}

async function getDb() {
  if (globalThis.__ecoDb) return globalThis.__ecoDb;
  let db;
  if (process.env.DATABASE_URL) {
    const pool = new pg.Pool({ connectionString: dbUrl(), max: 5 });
    db = { query: (text, params) => pool.query(text, params) };
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const lite = new PGlite(process.env.PGLITE_DIR || './.pglite');
    db = { query: (text, params) => lite.query(text, params) };
  }
  globalThis.__ecoDb = db;
  return db;
}

export async function query(text, params = []) {
  const db = await getDb();
  return db.query(text, params);
}
