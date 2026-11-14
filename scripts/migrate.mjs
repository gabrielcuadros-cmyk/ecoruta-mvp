// Ejecuta las migraciones pendientes y carga la semilla de datos ficticios.
// Se corre antes de "next build" (también en Vercel), así la base queda lista en cada despliegue.
import pg from 'pg';
import { migrations } from './migrations.mjs';
import { seed } from './seed.mjs';

async function connect() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.delete('channel_binding');
    const client = new pg.Client({ connectionString: url.toString() });
    await client.connect();
    return { query: (t, p) => client.query(t, p), exec: (t) => client.query(t), end: () => client.end() };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const lite = new PGlite(process.env.PGLITE_DIR || './.pglite');
  return { query: (t, p) => lite.query(t, p), exec: (t) => lite.exec(t), end: () => lite.close() };
}

const db = await connect();
await db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
const done = new Set((await db.query('SELECT id FROM schema_migrations')).rows.map((r) => r.id));
for (const m of migrations) {
  if (done.has(m.id)) continue;
  await db.exec(m.sql);
  await db.query('INSERT INTO schema_migrations (id) VALUES ($1)', [m.id]);
  console.log('Migración aplicada:', m.id);
}
await seed(db);
await db.end();
console.log('Base de datos lista.');
