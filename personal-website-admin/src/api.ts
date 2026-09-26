export const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
let csrf = '';
export function setCsrf(value: string) { csrf = value; }
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const form = body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API}/api/admin${path}`, { method, credentials: 'include', headers: { ...(body && !form ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) }, body: body ? form ? body : JSON.stringify(body) : undefined, signal: AbortSignal.timeout(form ? 60000 : 15000) });
  } catch { throw new ApiError('Could not reach the backend. Check the connection and try again.', 0); }
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') window.dispatchEvent(new Event('session-expired'));
    const details = data.fields ? Object.entries(data.fields).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join(' · ') : '';
    throw new ApiError(`${data.error || 'The request failed.'}${details ? ` ${details}` : ''}`, response.status);
  }
  return data as T;
}
export type Entry<T> = { id: string; version: number; content: T; createdAt: string; modifiedAt: string };
export type Media = { id: string; url: string; mimeType: string; size: number; width: number | null; height: number | null; originalName: string; createdAt: string };
export type ImageValue = { src: string; alt: string; caption?: string; width: number; height: number };
export type Feature = { title: string; description: string; image?: ImageValue };
export type VideoValue = { kind: 'file'; src: string; caption: string; transcript: string; poster?: string; captions?: string } | { kind: 'external'; url: string; caption: string; poster?: ImageValue };
export type EditorContent = {
  title: string; slug: string; summary: string; published: boolean;
  description?: string[]; status?: string; featured?: boolean; order?: number; coverImage?: ImageValue;
  images?: ImageValue[]; features?: Feature[]; video?: VideoValue; story?: string[]; technicalDescription?: string[];
  technologies?: string[]; liveUrl?: string; repositoryUrl?: string; openToCollaborators?: boolean; collaborationDescription?: string;
  currentStatus?: string; nextSteps?: string[]; relatedLinks?: { label: string; url: string }[]; startedAt?: string; updatedAt?: string; contentNote?: string;
  kind?: 'original' | 'external'; date?: string; category?: string; tags?: string[]; image?: ImageValue; body?: string[];
  source?: string; externalUrl?: string; myComment?: string;
};
export async function allItems<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await api<{ items: T[] }>(`${path}?limit=100&offset=${offset}`);
    items.push(...page.items); if (page.items.length < 100) return items;
  }
}
export const mediaUrl = (value: string) => `${API}${value}`;
