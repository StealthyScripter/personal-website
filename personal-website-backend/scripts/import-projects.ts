import fs from 'node:fs/promises';
import { database } from '../src/db.js';
import { getConfig } from '../src/config.js';
import { planProjectImport, applyProjectImport } from '../src/import-projects.js';

const [, , filename, flag] = process.argv;
if (!filename || (flag && flag !== '--apply')) throw new Error('Usage: import-projects.ts <manifest.json> [--apply]. Default is a read-only plan.');
const input: unknown = JSON.parse(await fs.readFile(filename, 'utf8'));
const db = database(getConfig().DATABASE_URL);
const lock = await db.connect();
try {
  await lock.query('SELECT pg_advisory_lock(782433)');
  const existing = (await db.query("SELECT id,version,content FROM content_items WHERE kind='project' ORDER BY sort_order,created_at")).rows;
  const plan = planProjectImport(input, existing);
  console.table(plan.map(({ action, content, preservedFields }) => ({ action, title: content.title, order: content.order, featured: content.featured, published: content.published, preservedFields: preservedFields.join(', ') })));
  if (flag === '--apply') {
    await fs.mkdir('.local/imports', { recursive: true });
    const backup = `.local/imports/projects-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await fs.writeFile(backup, JSON.stringify(existing, null, 2), { flag: 'wx', mode: 0o600 });
    console.log(`Saved pre-import project snapshot: ${backup}`);
    console.table(await applyProjectImport(db, plan));
  } else console.log('Read-only plan. Add --apply to import through the existing content service.');
} finally {
  await lock.query('SELECT pg_advisory_unlock(782433)');
  lock.release(); await db.end();
}
