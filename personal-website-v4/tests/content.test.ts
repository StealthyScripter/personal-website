import assert from 'node:assert/strict';
import test from 'node:test';
import { projectSchema, noteSchema, assetPath } from '../src/lib/content/schema';

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
