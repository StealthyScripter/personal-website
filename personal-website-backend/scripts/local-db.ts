import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';

// Isolated local development cluster. Production uses managed PostgreSQL.
if (!fs.existsSync('.env')) {
  const password = randomBytes(24).toString('hex');
  fs.writeFileSync('.env', `DATABASE_URL=postgresql://site_local:${password}@127.0.0.1:55432/personal_site\nSECURITY_SECRET=${randomBytes(32).toString('hex')}\nPUBLIC_ORIGIN=http://localhost:3000\nADMIN_ORIGIN=http://localhost:5173\nAPI_ORIGIN=http://localhost:4000\n`, { flag: 'wx', mode: 0o600 });
}
const env = parseEnv(fs.readFileSync('.env', 'utf8'));
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is missing.');
const url = new URL(env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.port !== '55432') throw new Error('db:local only manages the isolated 127.0.0.1:55432 development cluster.');
const pg = new EmbeddedPostgres({ databaseDir: '.local/postgres', user: url.username, password: url.password, port: 55432, persistent: true, authMethod: 'scram-sha-256', postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
if (!fs.existsSync('.local/postgres/PG_VERSION')) await pg.initialise();
await pg.start();
const client = pg.getPgClient(); await client.connect();
const databaseName = url.pathname.slice(1);
if (!/^[a-z_]+$/.test(databaseName)) throw new Error('Use a simple local database name.');
if (!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [databaseName])).rowCount) await pg.createDatabase(databaseName);
await client.end();
console.log('Local PostgreSQL is ready on 127.0.0.1:55432. Connection settings are in the ignored .env file.');
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, async () => { await pg.stop(); process.exit(0); });
await new Promise(() => {});
