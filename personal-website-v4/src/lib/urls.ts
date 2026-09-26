export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export function assetUrl(src: string) {
  if (src.startsWith('/api/media/')) return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${src}`;
  return `${basePath}${src}`;
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
