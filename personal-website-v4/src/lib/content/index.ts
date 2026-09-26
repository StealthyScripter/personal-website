import { cache } from 'react';
import { z } from 'zod';
import { noteSchema, projectSchema } from './schema';

const backend = process.env.BACKEND_URL || 'http://localhost:4000';
async function get(path: string) {
  const response = await fetch(`${backend}/api/${path}`, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Content is temporarily unavailable.');
  return response.json();
}
async function collection<T>(path: string, schema: z.ZodType<T>): Promise<T[]> {
  const items: T[] = [];
  for (let offset = 0; offset <= 100000; offset += 100) {
    const page = z.object({ items: z.array(schema) }).parse(await get(`${path}?limit=100&offset=${offset}`));
    items.push(...page.items);
    if (page.items.length < 100) return items;
  }
  throw new Error('Content collection exceeds the supported size.');
}
export const getProjects = cache(() => collection('projects', projectSchema));
export const getNotes = cache(() => collection('notes', noteSchema));
export const getProject = cache(async (slug: string) => { const data = await get(`projects/${encodeURIComponent(slug)}`); return data ? projectSchema.parse(data) : null; });
export const getNote = cache(async (slug: string) => { const data = await get(`notes/${encodeURIComponent(slug)}`); return data ? noteSchema.parse(data) : null; });
const currentlySchema = z.object({ label: z.string(), text: z.string(), href: z.string(), visible: z.boolean(), order: z.number() });
export const getCurrently = cache(async () => z.object({ items: z.array(currentlySchema) }).parse(await get('currently')).items);
const settingsSchema = z.object({
  name: z.string(), description: z.string(), email: z.email(),
  hero: z.object({ eyebrow: z.string(), thought: z.string(), introduction: z.string() }),
  about: z.array(z.string()), social: z.array(z.object({ label: z.string(), url: z.url() })),
});
export const getSettings = cache(async () => settingsSchema.parse(await get('settings')));
export type SiteSettings = z.infer<typeof settingsSchema>;
