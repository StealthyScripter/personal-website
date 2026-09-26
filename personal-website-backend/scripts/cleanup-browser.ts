import fs from 'node:fs/promises';
import path from 'node:path';
import { database } from '../src/db.js';
import { getConfig } from '../src/config.js';

// Only inactive databases with this integration suite's random-name format.
const db = database(getConfig().DATABASE_URL);
try {
  const result = await db.query("SELECT datname FROM pg_database WHERE datname LIKE 'site_browser_%' AND NOT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datid=pg_database.oid)");
  for (const { datname } of result.rows) {
    if (!/^site_browser_[a-f0-9]{12}$/.test(datname)) continue;
    const root = path.resolve('.local'), target = path.resolve(root, datname);
    if (path.dirname(target) !== root) throw new Error('Unsafe test cleanup path');
    await db.query(`DROP DATABASE ${datname}`);
    await fs.rm(target, { recursive: true, force: true });
    console.log(`Removed inactive integration database ${datname}.`);
  }
  const file = '.local/browser-session.json';
  try { const { name } = JSON.parse(await fs.readFile(file, 'utf8')); if (!(await db.query('SELECT 1 FROM pg_database WHERE datname=$1', [name])).rowCount) await fs.rm(file); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
} finally { await db.end(); }
