import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getNotes, getProjects } from '@/lib/content';
import { basePath } from '@/lib/urls';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, notes] = await Promise.all([getProjects(), getNotes()]);
  return ['/', ...projects.map((p) => `/projects/${p.slug}/`), ...notes.filter((n) => n.kind === 'original').map((n) => `/notes/${n.slug}/`)].map((route) => ({ url: `${site.url}${basePath}${route}` }));
}
