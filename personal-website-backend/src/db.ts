import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export function database(connectionString: string) { return new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 5000, statement_timeout: 10000 }); }
export type Database = ReturnType<typeof database>;
export type Queryable = Pick<pg.PoolClient, 'query'>;
// Serialize changes to JSON media references with deletion of their assets.
export async function withMediaLock<T>(db: Database, work: (client: pg.PoolClient) => Promise<T>) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(782432)');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function migrate(db: Database) {
  const client = await db.connect();
  try {
    await client.query("SELECT pg_advisory_lock(782431)");
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const file of (await fs.readdir('migrations')).filter((v) => v.endsWith('.sql')).sort()) {
      const sql = await fs.readFile(path.join('migrations', file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name=$1', [file]);
      if (existing.rowCount) { if (existing.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${file}`); continue; }
      await client.query('BEGIN');
      try { await client.query(sql); await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [file, checksum]); await client.query('COMMIT'); }
      catch (error) { await client.query('ROLLBACK'); throw error; }
    }
  } finally { await client.query('SELECT pg_advisory_unlock(782431)'); client.release(); }
}
export async function audit(db: Database, actor: string | null, action: string, entity?: string) {
  await db.query('INSERT INTO audit_events(id,actor_id,action,entity_id) VALUES($1,$2,$3,$4)', [randomUUID(), actor, action, entity || null]);
}
