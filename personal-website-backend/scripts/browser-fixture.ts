import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { getConfig } from '../src/config.js';
import { database, migrate } from '../src/db.js';
import { seed } from '../src/seed.js';
import { manageAccount } from '../src/accounts.js';
import { buildApp } from '../src/app.js';

// Disposable integration environment; never changes the configured content database.
const base = getConfig();
const source = database(base.DATABASE_URL);
const name = `site_browser_${randomBytes(6).toString('hex')}`;
await source.query(`CREATE DATABASE ${name}`);
const url = new URL(base.DATABASE_URL); url.pathname = `/${name}`;
const config = { ...base, NODE_ENV: 'test' as const, DATABASE_URL: url.href, PORT: 4100, PUBLIC_ORIGIN: 'http://localhost:3100', ADMIN_ORIGIN: 'http://localhost:5183', API_ORIGIN: 'http://localhost:4100', MEDIA_DIR: `.local/${name}` };
const db = database(config.DATABASE_URL);
await migrate(db); await seed(db, config);
const email = 'browser@example.test', password = randomBytes(24).toString('base64url');
await manageAccount(db, 'create', email, password);
await fs.writeFile('.local/browser-session.json', JSON.stringify({ email, password, name }), { mode: 0o600 });
const app = await buildApp(config, db);
await app.listen({ port: 4100, host: '127.0.0.1' });
let closing = false;
async function close() {
  if (closing) return; closing = true;
  await app.close(); await db.end(); await source.query(`DROP DATABASE ${name} WITH (FORCE)`); await source.end();
  await fs.rm(config.MEDIA_DIR, { recursive: true, force: true }); await fs.rm('.local/browser-session.json', { force: true }); process.exit(0);
}
process.on('SIGINT', close); process.on('SIGTERM', close);
console.log('Disposable browser API ready on port 4100.');
