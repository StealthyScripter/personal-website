import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import pg from 'pg';

// Opt-in fixture runner for an isolated Compose project, never a production task.
assert.equal(process.env.DOCKER_VERIFICATION, '1', 'Use scripts/verify-docker.ps1.');
assert.equal(process.env.NODE_ENV, 'development');
assert.equal(new URL(process.env.DATABASE_URL).hostname, 'postgres');
assert.equal(new URL(process.env.S3_ENDPOINT).hostname, 'minio');
assert.equal(process.versions.node.split('.')[0], '20');
const stateFile = '/app/.docker-verification/state.json';
const phase = process.argv[2];
const endpoint = 'http://backend:4000';
const origin = 'http://localhost:5173';
let cookie = '', csrf = '';
async function request(path, { method = 'GET', body, admin = false, publicForm = false } = {}) {
  const form = body instanceof FormData;
  return fetch(`${endpoint}${path}`, {
    method, signal: AbortSignal.timeout(30000),
    headers: { ...(body && !form ? { 'content-type': 'application/json' } : {}), ...(admin ? { origin, cookie, 'x-csrf-token': csrf } : {}), ...(publicForm ? { origin: 'http://localhost:3000' } : {}) },
    body: body ? form ? body : JSON.stringify(body) : undefined,
  });
}
async function json(response, status = 200) {
  assert.equal(response.status, status, `Unexpected status for ${response.url}`);
  return response.json();
}
async function login(state) {
  const response = await request('/api/admin/auth/login', { method: 'POST', admin: true, body: { email: state.email, password: state.password } });
  const session = await json(response);
  cookie = response.headers.get('set-cookie').split(';')[0]; csrf = session.csrfToken;
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
}
function account(action, email, password) {
  const child = spawnSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'admin', action, email, ...(password ? ['--password-stdin'] : [])], { input: password ? `${password}\n` : undefined, encoding: 'utf8', env: process.env });
  assert.equal(child.status, 0, `Backend CLI ${action} failed: ${child.stderr}`);
  if (password) assert.ok(!`${child.stdout}${child.stderr}`.includes(password));
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

if (phase === 'prepare') {
  const suffix = randomBytes(8).toString('hex');
  const state = { email: `docker-${suffix}@example.test`, password: randomBytes(24).toString('base64url'), slug: `docker-${suffix}` };
  // Save immediately so a failed run has a recovery record inside its own volume.
  const save = () => fs.writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
  await save();
  account('create', state.email, state.password);
  await login(state);
  assert.equal((await request('/health')).status, 200);
  const preflight = await fetch(`${endpoint}/api/admin/overview`, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'GET' } });
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  assert.equal((await request('/api/admin/overview', { admin: true })).status, 200);
  const projects = await json(await request('/api/projects'));
  assert.equal(projects.items.length, 3);
  const home = await fetch('http://v4:3000/');
  assert.equal(home.status, 200); assert.ok((await home.text()).includes(projects.items[0].title));
  const adminPage = await fetch('http://admin:5173/');
  assert.equal(adminPage.status, 200); assert.match(await adminPage.text(), /Personal site administration/);
  const adminConfig = await fetch('http://admin:5173/src/api.ts');
  assert.ok((await adminConfig.text()).includes('http://localhost:4000'));

  const subject = `Docker persistence ${suffix}`;
  const submitted = await json(await request('/api/messages', { method: 'POST', publicForm: true, body: { name: 'Docker verification', email: state.email, subject, message: 'A message persisted through the public endpoint.' } }), 201);
  assert.equal(submitted.accepted, true);
  const inbox = await json(await request('/api/admin/messages', { admin: true }));
  const message = inbox.items.find((item) => item.subject === subject);
  assert.ok(message); assert.equal(message.status, 'unread'); assert.ok(Date.parse(message.createdAt));
  state.messageId = message.id; await save();

  const form = new FormData();
  form.append('file', new Blob([await fs.readFile('seed/media/project-phone.png')], { type: 'image/png' }), 'docker-verification.png');
  state.asset = await json(await request('/api/admin/media', { method: 'POST', body: form, admin: true }), 201); await save();
  assert.equal((await request(state.asset.url)).status, 404, 'Unpublished upload must be private');
  const content = { kind: 'original', title: `Docker verification ${suffix}`, slug: state.slug, summary: 'Docker persistence check.', date: '2026-09-25', category: 'Verification', body: ['Content stored in PostgreSQL across container recreation.'], published: true, image: { src: state.asset.url, alt: 'Verification image', width: state.asset.width, height: state.asset.height } };
  state.note = await json(await request('/api/admin/notes', { method: 'POST', admin: true, body: { content } }), 201); await save();
  const mediaResponse = await request(state.asset.url);
  assert.equal(mediaResponse.status, 200); state.mediaHash = hash(Buffer.from(await mediaResponse.arrayBuffer())); await save();
  const anonymousObject = await fetch(`http://minio:9000/${process.env.S3_BUCKET}/${state.asset.id}.webp`);
  assert.equal(anonymousObject.status, 403, 'The bucket must not allow anonymous object reads');
  const notePage = await fetch(`http://v4:3000/notes/${state.slug}/`);
  assert.equal(notePage.status, 200); assert.ok((await notePage.text()).includes(content.body[0]));

  // Verify automatic startup will not recreate a deliberately deleted seed entry.
  const notes = await json(await request('/api/admin/notes', { admin: true }));
  state.deletedSeed = notes.items.find((item) => item.content.slug === 'example-original');
  assert.ok(state.deletedSeed); await save();
  assert.equal((await request(`/api/admin/notes/${state.deletedSeed.id}?version=${state.deletedSeed.version}`, { method: 'DELETE', admin: true })).status, 204);
  console.log('PASS before restart: Node 20, CLI account, login/CORS, health, frontend HTTP, SSR content, persisted inbox, uploaded media, private bucket.');
} else if (phase === 'check') {
  const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  await login(state);
  const message = await json(await request(`/api/admin/messages/${state.messageId}`, { admin: true }));
  assert.equal(message.email, state.email); assert.equal(message.status, 'unread');
  const note = await json(await request(`/api/notes/${state.slug}`));
  assert.equal(note.title, state.note.content.title);
  const mediaResponse = await request(state.asset.url); assert.equal(mediaResponse.status, 200);
  assert.equal(hash(Buffer.from(await mediaResponse.arrayBuffer())), state.mediaHash);
  const notes = await json(await request('/api/admin/notes', { admin: true }));
  assert.ok(!notes.items.some((item) => item.content.slug === state.deletedSeed.content.slug), 'Startup must not restore deleted seed content');
  const home = await fetch('http://v4:3000/'); assert.equal(home.status, 200); assert.ok((await home.text()).includes(note.title));
  console.log('PASS after down/up: admin account, PostgreSQL content/message and byte-identical object survived; deleted seed stayed deleted.');

  // Remove only fixtures created by this run and restore the seed entry it deleted.
  assert.equal((await request(`/api/admin/notes/${state.note.id}?version=${state.note.version}`, { method: 'DELETE', admin: true })).status, 204);
  assert.equal((await request(`/api/admin/media/${state.asset.id}`, { method: 'DELETE', admin: true })).status, 204);
  await json(await request('/api/admin/notes', { method: 'POST', admin: true, body: { content: state.deletedSeed.content } }), 201);
  const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try { await db.query('DELETE FROM messages WHERE id=$1 AND email=$2', [state.messageId, state.email]); } finally { await db.end(); }
  account('remove', state.email);
  await fs.unlink(stateFile);
  console.log('Verification fixtures and temporary credentials removed.');
} else throw new Error('Use prepare or check.');
