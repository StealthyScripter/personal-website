import { z } from 'zod';

const text = z.string().trim().min(1).max(10000);
const title = text.max(200);
const slug = text.max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const httpsUrl = z.url({ protocol: /^https$/ }).max(2000);
// Managed media references are backend-owned paths, not arbitrary URLs.
export const mediaPath = z.string().regex(/^\/api\/media\/[0-9a-f-]{36}\/file$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
const paragraphs = z.array(text).min(1).max(100);
export const imageSchema = z.strictObject({ src: mediaPath, alt: title, caption: text.max(1000).optional(), width: z.number().int().positive().max(12000), height: z.number().int().positive().max(12000) });
const videoSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('file'), src: mediaPath, poster: mediaPath.optional(), caption: title, transcript: text, captions: mediaPath.optional() }),
  z.strictObject({ kind: z.literal('external'), url: httpsUrl, poster: imageSchema.optional(), caption: title }),
]);
export const projectSchema = z.strictObject({
  title, slug, summary: text.max(500), description: paragraphs,
  status: z.enum(['Active', 'Exploring', 'Open to Collaborators', 'Maintained', 'Archived']).optional(),
  featured: z.boolean().default(false), order: z.number().int().min(0).max(100000).default(100), published: z.boolean().default(false),
  coverImage: imageSchema.optional(), images: z.array(imageSchema).max(40).default([]), video: videoSchema.optional(),
  features: z.array(z.strictObject({ title, description: text, image: imageSchema.optional() })).max(30).default([]),
  story: paragraphs.optional(), technicalDescription: paragraphs.optional(), technologies: z.array(title).max(40).default([]),
  liveUrl: httpsUrl.optional(), repositoryUrl: httpsUrl.optional(), openToCollaborators: z.boolean().default(false),
  collaborationDescription: text.optional(), currentStatus: text.optional(), nextSteps: z.array(text).min(1).max(30).optional(),
  relatedLinks: z.array(z.strictObject({ label: title, url: httpsUrl })).max(30).default([]),
  startedAt: date.optional(), updatedAt: date.optional(), contentNote: text.optional(),
}).superRefine((p, ctx) => {
  if (p.published && !p.coverImage) ctx.addIssue({ code: 'custom', path: ['coverImage'], message: 'A published project needs a cover image' });
  if (p.openToCollaborators && !p.collaborationDescription) ctx.addIssue({ code: 'custom', path: ['collaborationDescription'], message: 'Explain the collaboration you welcome' });
  if (p.status === 'Open to Collaborators' && !p.openToCollaborators) ctx.addIssue({ code: 'custom', path: ['openToCollaborators'], message: 'Enable collaboration for this status' });
});
const noteBase = { title, slug, date, category: title, tags: z.array(title).max(20).default([]), summary: text.max(1000), published: z.boolean().default(false), image: imageSchema.optional() };
export const noteSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...noteBase, kind: z.literal('original'), body: paragraphs }),
  z.strictObject({ ...noteBase, kind: z.literal('external'), source: title, externalUrl: httpsUrl, myComment: text }),
]);
export const currentlySchema = z.strictObject({ label: z.enum(['Building', 'Reading', 'Exploring', 'Open to']), text: z.string().trim().max(1000), href: z.union([httpsUrl, z.literal('/#contact'), z.literal('')]).default(''), visible: z.boolean().default(false), order: z.number().int().min(0).max(100).default(0) }).refine((v) => !v.visible || v.text.length > 0, 'Visible items need text');
export const settingsSchema = z.strictObject({
  name: title, description: text.max(500), email: z.email().max(254),
  hero: z.strictObject({ eyebrow: title, thought: title, introduction: text.max(1000) }),
  about: z.array(text).min(1).max(5), social: z.array(z.strictObject({ label: title, url: httpsUrl })).max(10),
});
export const messageSchema = z.strictObject({
  name: z.string().trim().min(1).max(100), email: z.email().max(254),
  subject: z.string().trim().max(200).default(''), message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).default(''),
});
export const loginSchema = z.strictObject({ email: z.email().max(254).transform((v) => v.toLowerCase()), password: z.string().min(1).max(256) });
export const passwordSchema = z.string().min(14).max(256);
export type Project = z.infer<typeof projectSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export const collectionSchemas = { project: projectSchema, note: noteSchema, currently: currentlySchema };
export type Kind = keyof typeof collectionSchemas;
