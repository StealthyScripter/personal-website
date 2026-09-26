import { getConfig } from './config.js';
import { database } from './db.js';
import { buildApp } from './app.js';

const config = getConfig();
const db = database(config.DATABASE_URL);
const app = await buildApp(config, db);
await app.listen({ port: config.PORT, host: config.HOST });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, async () => { await app.close(); await db.end(); process.exit(0); });
