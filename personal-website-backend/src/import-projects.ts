import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { projectSchema, type Project } from './schemas.js';
import { saveContent } from './content.js';
import { audit, type Database } from './db.js';

export const projectImportSchema = z.array(z.strictObject({
  repository: z.string().regex(/^[\w.-]+$/), private: z.boolean(),
  revision: z.string().regex(/^[0-9a-f]{7,40}$/), evidence: z.array(z.string()).min(1),
  review: z.array(z.string()), content: projectSchema,
})).min(1);
export type ProjectImport = z.infer<typeof projectImportSchema>[number];
type Existing = { id: string; version: number; content: Project };
export type ProjectImportPlan = { id?: string; version?: number; action: 'create' | 'update' | 'unchanged'; content: Project; preservedFields: string[] };
const normalize = (value = '') => value.trim().toLowerCase().replace(/\.git\/?$/, '').replace(/\/$/, '');

// An explicit backend import, never a frontend content source or startup seed.
export function planProjectImport(input: unknown, existing: Existing[]): ProjectImportPlan[] {
  const entries = projectImportSchema.parse(input);
  const claimed = new Set<string>();
  const slugs = new Set<string>();
  const titles = new Set<string>();
  const repositories = new Set<string>();
  const orders = new Set<number>();
  const plan: ProjectImportPlan[] = [];
  for (const entry of entries) {
    const incoming = entry.content;
    const repositoryUrl = `https://github.com/StealthyScripter/${entry.repository}`;
    if (slugs.has(incoming.slug) || titles.has(normalize(incoming.title)) || repositories.has(normalize(repositoryUrl)) || orders.has(incoming.order)) throw new Error('Duplicate import identity or display order.');
    slugs.add(incoming.slug); titles.add(normalize(incoming.title)); repositories.add(normalize(repositoryUrl));
    orders.add(incoming.order);
    const matches = existing.filter(({ content }) => content.slug === incoming.slug || normalize(content.title) === normalize(incoming.title) || (content.repositoryUrl && normalize(content.repositoryUrl) === normalize(repositoryUrl)));
    if (matches.length > 1) throw new Error(`Ambiguous existing records for ${incoming.title}; resolve duplicates before importing.`);
    const match = matches[0];
    if (match?.content.repositoryUrl && normalize(match.content.repositoryUrl) !== normalize(repositoryUrl)) throw new Error(`Conflicting repository identity for ${incoming.title}; review before importing.`);
    if (match && claimed.has(match.id)) throw new Error('One existing record matches multiple imports.');
    if (match) claimed.add(match.id);
    const content = { ...incoming, ...match?.content };
    const preservedFields: string[] = [];
    // Fill empty optional fields; keep curated descriptions, media, links and status.
    for (const [key, value] of Object.entries(incoming)) {
      const current = match?.content[key as keyof Project];
      if (current === undefined || current === '' || (Array.isArray(current) && current.length === 0)) Object.assign(content, { [key]: value });
      else if (!isDeepStrictEqual(current, value) && !['title', 'order', 'featured', 'published'].includes(key)) preservedFields.push(key);
    }
    Object.assign(content, { title: incoming.title, order: incoming.order, featured: incoming.featured });
    if (entry.private) {
      content.published = false;
      delete content.repositoryUrl;
      content.relatedLinks = content.relatedLinks.filter((link) => normalize(link.url) !== normalize(repositoryUrl));
    }
    const validated = projectSchema.parse(content);
    plan.push({ id: match?.id, version: match?.version, action: !match ? 'create' : isDeepStrictEqual(match.content, validated) ? 'unchanged' : 'update', content: validated, preservedFields });
  }
  // Keep unrelated records and their relative order, after the requested collection.
  // Only the requested first three remain designated as homepage featured work.
  let order = Math.max(...entries.map((entry) => entry.content.order)) + 1;
  for (const row of [...existing].filter((row) => !claimed.has(row.id)).sort((a, b) => a.content.order - b.content.order)) {
    const content = projectSchema.parse({ ...row.content, order: Math.max(order, row.content.order), featured: false });
    order = content.order + 1;
    plan.push({ id: row.id, version: row.version, action: isDeepStrictEqual(row.content, content) ? 'unchanged' : 'update', content, preservedFields: [] });
  }
  return plan;
}

export async function applyProjectImport(db: Database, plan: ProjectImportPlan[]) {
  const results = [];
  for (const entry of plan) {
    if (entry.action === 'unchanged') { results.push({ id: entry.id, action: entry.action, title: entry.content.title }); continue; }
    const saved = await saveContent(db, 'project', entry.content, entry.id, entry.version);
    await audit(db, null, `projects.import.${entry.action}`, String(saved.id));
    results.push({ id: saved.id, action: entry.action, title: entry.content.title });
  }
  return results;
}
