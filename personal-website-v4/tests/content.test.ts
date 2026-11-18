import assert from 'node:assert/strict';
import test from 'node:test';
import { projectSchema, noteSchema, assetPath } from '../src/lib/content/schema';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../src/app/page';

const minimalProject = {
  title: 'Example', slug: 'example', summary: 'An example project.', description: ['An explanation.'],
  coverImage: { src: '/api/media/12345678-1234-4234-8234-123456789abc/file', alt: 'Example interface' },
};

test('project data defaults do not invent status or collaboration', () => {
  const project = projectSchema.parse(minimalProject);
  assert.equal(project.status, undefined);
  assert.equal(project.openToCollaborators, false);
  assert.deepEqual(project.images, []);
  assert.equal(project.video, undefined);
});

test('content rejects unsupported links, malformed dates, unknown fields, and unsafe paths', () => {
  assert.equal(projectSchema.safeParse({ ...minimalProject, liveUrl: 'javascript:alert(1)' }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, updatedAt: '2026-02-30' }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, featuredProject: true }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, slug: '../escape' }).success, false);
  for (const value of ['/../private.txt', '//example.com/file.png', '/projects/../../file.png']) assert.equal(assetPath.safeParse(value).success, false);
});

test('collaboration needs an explicit flag and useful context', () => {
  assert.equal(projectSchema.safeParse({ ...minimalProject, status: 'Open to Collaborators' }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, openToCollaborators: true }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, openToCollaborators: true, collaborationDescription: 'Help improve keyboard access.' }).success, true);
});

test('original and external notes require their own content and default to draft', () => {
  const base = { title: 'Example', slug: 'example', date: '2026-09-23', category: 'Ideas', summary: 'Example summary.' };
  assert.equal(noteSchema.parse({ ...base, kind: 'original', body: ['A paragraph.'] }).published, false);
  assert.equal(noteSchema.safeParse({ ...base, kind: 'original' }).success, false);
  assert.equal(noteSchema.safeParse({ ...base, kind: 'external', externalUrl: 'https://example.com', source: 'Example' }).success, false);
  assert.equal(noteSchema.safeParse({ ...base, kind: 'external', externalUrl: 'https://example.com', source: 'Example', myComment: 'Why I am sharing it.' }).success, true);
});

test('local video requires a transcript and external video does not require a file', () => {
  assert.equal(projectSchema.safeParse({ ...minimalProject, video: { kind: 'file', src: '/demo.webm', caption: 'A demo' } }).success, false);
  assert.equal(projectSchema.safeParse({ ...minimalProject, video: { kind: 'external', url: 'https://example.com', caption: 'A demo' } }).success, true);
});

test('homepage distinguishes unavailable collections from successful empty responses', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  const failed = renderToStaticMarkup(await Home());
  assert.match(failed, /This content is temporarily unavailable/);
  assert.doesNotMatch(failed, /Work in Progress|A little room for ideas\./);
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }));
  const empty = renderToStaticMarkup(await Home());
  assert.match(empty, /Featured Work/);
  assert.match(empty, /Work in Progress/);
  assert.match(empty, /A little room for ideas\./);
  // Settings are deliberately invalid in this fixture; only the collections succeeded.
  assert.doesNotMatch(empty.match(/<section id="projects"[\s\S]*?<\/section>/)?.[0] || '', /temporarily unavailable/);
});
