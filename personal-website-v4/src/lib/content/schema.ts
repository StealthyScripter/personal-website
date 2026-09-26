import { z } from 'zod';

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase, hyphenated slug');
export const externalUrl = z.url({ protocol: /^https$/ });
export const assetPath = text.refine(
  (value) => /^\/api\/media\/[a-f0-9-]{36}\/file$/.test(value),
  'Use a managed backend media path',
);
const date = text.regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine(
  (value) => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
  'Use a real calendar date',
);

export const imageSchema = z.strictObject({
  src: assetPath,
  alt: text,
  caption: text.optional(),
  width: z.number().int().positive().default(1408),
  height: z.number().int().positive().default(768),
});

const videoSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('file'),
    src: assetPath,
    poster: assetPath.optional(),
    caption: text,
    transcript: text,
    captions: assetPath.optional(),
  }),
  z.strictObject({
    kind: z.literal('external'),
    url: externalUrl,
    poster: imageSchema.optional(),
    caption: text,
  }),
]);

export const projectSchema = z.strictObject({
  title: text,
  slug,
  summary: text,
  description: z.array(text).min(1),
  status: z.enum(['Active', 'Exploring', 'Open to Collaborators', 'Maintained', 'Archived']).optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(100),
  published: z.boolean().default(true),
  coverImage: imageSchema,
  images: z.array(imageSchema).default([]),
  video: videoSchema.optional(),
  features: z.array(z.strictObject({ title: text, description: text, image: imageSchema.optional() })).default([]),
  story: z.array(text).min(1).optional(),
  technicalDescription: z.array(text).min(1).optional(),
  technologies: z.array(text).default([]),
  liveUrl: externalUrl.optional(),
  repositoryUrl: externalUrl.optional(),
  openToCollaborators: z.boolean().default(false),
  collaborationDescription: text.optional(),
  currentStatus: text.optional(),
  nextSteps: z.array(text).min(1).optional(),
  relatedLinks: z.array(z.strictObject({ label: text, url: externalUrl })).default([]),
  startedAt: date.optional(),
  updatedAt: date.optional(),
  contentNote: text.optional(),
}).superRefine((project, ctx) => {
  if (project.status === 'Open to Collaborators' && !project.openToCollaborators) {
    ctx.addIssue({ code: 'custom', path: ['openToCollaborators'], message: 'Collaboration status requires openToCollaborators: true' });
  }
  if (project.openToCollaborators && !project.collaborationDescription) {
    ctx.addIssue({ code: 'custom', path: ['collaborationDescription'], message: 'Explain the collaboration you welcome' });
  }
});

const noteBase = {
  title: text,
  slug,
  date,
  category: text,
  tags: z.array(text).default([]),
  summary: text,
  published: z.boolean().default(false),
  image: imageSchema.optional(),
};

export const noteSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...noteBase, kind: z.literal('original'), body: z.array(text).min(1) }),
  z.strictObject({ ...noteBase, kind: z.literal('external'), source: text, externalUrl, myComment: text }),
]);

export type Project = z.infer<typeof projectSchema>;
export type Note = z.infer<typeof noteSchema>;
export type ContentImage = z.infer<typeof imageSchema>;
export type ProjectVideo = z.infer<typeof videoSchema>;
