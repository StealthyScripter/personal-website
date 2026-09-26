import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { Database } from './db.js';
import type { Config } from './config.js';
import { saveMedia, storageFor } from './media.js';
import { saveContent } from './content.js';
import { settingsSchema } from './schemas.js';

// Backend-owned snapshot; there are deliberately no V4 imports or paths here.
export async function seed(db: Database, config: Config) {
  const storage = storageFor(config);
  for (const file of (await fs.readdir('seed/projects')).filter((v) => v.endsWith('.json'))) {
    const project = JSON.parse(await fs.readFile(path.join('seed/projects', file), 'utf8'));
    if ((await db.query("SELECT id FROM content_items WHERE kind='project' AND slug=$1", [project.slug])).rowCount) continue;
    const imageName = path.basename(project.coverImage.src);
    const digest = createHash('sha256').update(`seed:${imageName}`).digest('hex');
    const id = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
    const existing = await db.query('SELECT id,width,height FROM media_assets WHERE id=$1', [id]);
    const media = existing.rows[0] || await saveMedia(db, storage, await fs.readFile(path.join('seed/media', imageName)), imageName, 'image/png', id);
    project.coverImage = { ...project.coverImage, src: `/api/media/${id}/file`, width: media.width, height: media.height };
    await saveContent(db, 'project', { ...project, published: project.published ?? true });
  }
  for (const file of (await fs.readdir('seed/notes')).filter((v) => v.endsWith('.json'))) {
    const note = JSON.parse(await fs.readFile(path.join('seed/notes', file), 'utf8'));
    if (!(await db.query("SELECT id FROM content_items WHERE kind='note' AND slug=$1", [note.slug])).rowCount) await saveContent(db, 'note', note);
  }
  for (const [index, label] of ['Building', 'Reading', 'Exploring', 'Open to'].entries()) {
    const content = { label, order: index, visible: label === 'Open to', text: label === 'Open to' ? 'Thoughtful conversations and collaboration around meaningful projects.' : '', href: label === 'Open to' ? '/#contact' : '' };
    await db.query("INSERT INTO content_items(id,kind,content) VALUES($1,'currently',$2) ON CONFLICT(kind,slug) DO NOTHING", [randomUUID(), JSON.stringify(content)]);
  }
  const settings = settingsSchema.parse(JSON.parse(await fs.readFile('seed/settings.json', 'utf8')));
  await db.query('INSERT INTO site_settings(id,content) VALUES(1,$1) ON CONFLICT(id) DO NOTHING', [JSON.stringify(settings)]);
}
