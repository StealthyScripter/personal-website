import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { getConfig } from '../src/config.js';
import { database, migrate } from '../src/db.js';
import { buildApp } from '../src/app.js';
import { manageAccount } from '../src/accounts.js';
import { seed } from '../src/seed.js';
import { validateUpload } from '../src/media.js';

test('real PostgreSQL API, CLI, security and content workflows', { timeout: 120000 }, async (t) => {
  const env = { ...parseEnv(await fs.readFile('.env', 'utf8')), ...process.env };
  const base = getConfig(env);
  const source = database(base.DATABASE_URL);
  const name = `site_test_${randomBytes(6).toString('hex')}`;
  await source.query(`CREATE DATABASE ${name}`);
  const url = new URL(base.DATABASE_URL); url.pathname = `/${name}`;
  const config = { ...base, NODE_ENV: 'test' as const, DATABASE_URL: url.href, MEDIA_DIR: `.local/${name}` };
  const db = database(config.DATABASE_URL);
  const app = await buildApp(config, db);
  let cookie = '', csrf = '';
  const adminHeaders = () => ({ origin: config.ADMIN_ORIGIN, cookie, 'x-csrf-token': csrf });
  const email = 'verification@example.test', password = randomBytes(24).toString('base64url');
  const login = (address = email, secret = password) => app.inject({ method: 'POST', url: '/api/admin/auth/login', headers: { origin: config.ADMIN_ORIGIN }, payload: { email: address, password: secret } });
  const write = (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, payload?: object) => app.inject({ method, url: `/api/admin${path}`, headers: adminHeaders(), payload });
  const read = (path: string) => app.inject({ url: `/api/admin${path}`, headers: adminHeaders() });
  try {
    await t.test('clean migrations, repeat migration and idempotent seed', async () => {
      await migrate(db); await migrate(db); await seed(db, config); await seed(db, config);
      assert.equal((await db.query('SELECT count(*)::int AS count FROM content_items')).rows[0].count, 9);
      assert.equal((await app.inject('/api/projects')).json().items.length, 3);
      assert.equal((await app.inject('/api/notes')).json().items.length, 0);
    });
    await t.test('CLI creates an Argon2id account without disclosing passwords or hashes', async () => {
      const result = spawnSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'src/cli.ts', 'admin', 'create', email, '--password-stdin'], { env: { ...env, DATABASE_URL: config.DATABASE_URL }, input: `${password}\n`, encoding: 'utf8', windowsHide: true });
      assert.equal(result.status, 0, result.stderr);
      assert.ok(!`${result.stdout}${result.stderr}`.includes(password));
      const hash = (await db.query('SELECT password_hash FROM admin_users')).rows[0].password_hash;
      assert.match(hash, /^\$argon2id\$/); assert.notEqual(hash, password);
      const listed = await manageAccount(db, 'list'); assert.ok(!JSON.stringify(listed).includes(hash));
    });
    await t.test('unauthenticated, invalid, wrong and unknown authentication are rejected', async () => {
      for (const route of ['/overview', '/projects', '/notes', '/currently', '/messages', '/media', '/settings']) assert.equal((await app.inject(`/api/admin${route}`)).statusCode, 401);
      assert.equal((await app.inject({ url: '/api/admin/overview', headers: { cookie: 'bw_admin=invalid' } })).statusCode, 401);
      const wrong = await login(email, 'incorrect password'); const unknown = await login('unknown@example.test');
      assert.equal(wrong.statusCode, 401); assert.deepEqual(wrong.json(), unknown.json());
      for (const route of ['signup', 'register', 'forgot-password', 'reset-password', 'users', 'admins']) assert.equal((await app.inject({ method: 'POST', url: `/api/admin/${route}` })).statusCode, 404);
    });
    await t.test('valid login, cookie flags, origin and CSRF enforcement', async () => {
      const response = await login(); assert.equal(response.statusCode, 200);
      const raw = String(response.headers['set-cookie']); assert.match(raw, /HttpOnly/); assert.match(raw, /SameSite=Strict/);
      cookie = raw.split(';')[0]; csrf = response.json().csrfToken;
      assert.equal((await read('/overview')).statusCode, 200);
      assert.equal((await app.inject({ url: '/api/admin/overview', headers: { cookie, origin: config.PUBLIC_ORIGIN } })).statusCode, 403);
      assert.equal((await app.inject({ method: 'POST', url: '/api/admin/projects', headers: { cookie, origin: config.ADMIN_ORIGIN }, payload: {} })).statusCode, 403);
      assert.equal((await app.inject({ method: 'POST', url: '/api/messages', headers: { origin: 'https://untrusted.example' }, payload: {} })).statusCode, 403);
    });
    let asset: { id: string; url: string; width: number; height: number };
    await t.test('validated upload is re-encoded, private and independently authorized', async () => {
      const image = await sharp({ create: { width: 80, height: 48, channels: 3, background: '#7f8f7a' } }).png().toBuffer();
      const boundary = 'testBoundary';
      const payload = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="../example.png"\r\nContent-Type: image/png\r\n\r\n`), image, Buffer.from(`\r\n--${boundary}--\r\n`)]);
      const response = await app.inject({ method: 'POST', url: '/api/admin/media', headers: { ...adminHeaders(), 'content-type': `multipart/form-data; boundary=${boundary}` }, payload });
      assert.equal(response.statusCode, 201, response.body); asset = response.json(); assert.equal(response.json().mimeType, 'image/webp');
      const row = (await db.query('SELECT storage_key FROM media_assets WHERE id=$1', [asset.id])).rows[0]; assert.equal(row.storage_key, `${asset.id}.webp`);
      assert.equal((await app.inject(asset.url)).statusCode, 404);
      assert.equal((await app.inject({ url: asset.url, headers: adminHeaders() })).statusCode, 200);
      assert.equal((await app.inject({ url: asset.url, headers: { cookie, origin: config.PUBLIC_ORIGIN } })).statusCode, 404);
      await assert.rejects(validateUpload(image, 'fake.svg', 'image/svg+xml'));
      await assert.rejects(validateUpload(Buffer.from('<script>alert(1)</script>'), 'image.png', 'image/png'));
      await assert.rejects(validateUpload(Buffer.alloc(51 * 1024 * 1024), 'large.mp4', 'video/mp4'));
    });
    await t.test('project draft, publish, edit, optimistic conflict, media reference and unpublish', async () => {
      const content = { title: 'Verification project', slug: 'verification-project', summary: 'A test entry.', description: ['Project details.'], published: false, coverImage: { src: asset.url, alt: 'Test image', width: asset.width, height: asset.height }, images: [{ src: asset.url, alt: 'Screenshot', caption: 'Test caption', width: 80, height: 48 }], features: [{ title: 'A feature', description: 'Feature details' }], technologies: ['TypeScript'], liveUrl: 'https://example.com', repositoryUrl: 'https://example.com/repo', openToCollaborators: true, collaborationDescription: 'Test collaboration', currentStatus: 'Testing', nextSteps: ['Verify behavior'] };
      let response = await write('POST', '/projects', { content }); assert.equal(response.statusCode, 201, response.body); let entry = response.json();
      assert.equal((await app.inject('/api/projects/verification-project')).statusCode, 404);
      assert.equal((await write('DELETE', `/media/${asset.id}`)).statusCode, 409);
      response = await write('PUT', `/projects/${entry.id}`, { version: entry.version, content: { ...content, published: true } }); assert.equal(response.statusCode, 200); entry = response.json();
      assert.equal((await app.inject('/api/projects/verification-project')).statusCode, 200);
      assert.equal((await app.inject(asset.url)).statusCode, 200);
      const range = await app.inject({ url: asset.url, headers: { range: 'bytes=0-9' } }); assert.equal(range.statusCode, 206); assert.equal(range.rawPayload.length, 10);
      assert.equal((await write('PUT', `/projects/${entry.id}`, { version: 1, content })).statusCode, 409);
      response = await write('PUT', `/projects/${entry.id}`, { version: entry.version, content: { ...content, title: 'Updated project', published: true } }); entry = response.json();
      assert.equal((await app.inject('/api/projects/verification-project')).json().title, 'Updated project');
      response = await write('PUT', `/projects/${entry.id}`, { version: entry.version, content }); entry = response.json();
      assert.equal((await app.inject('/api/projects/verification-project')).statusCode, 404);
      assert.equal((await write('DELETE', `/projects/${entry.id}?version=${entry.version}`)).statusCode, 204);
      assert.equal((await write('DELETE', `/media/${asset.id}`)).statusCode, 204);
    });
    await t.test('original and external notes plus Currently visibility', async () => {
      const note = { kind: 'original', title: 'Verification note', slug: 'verification-note', date: '2026-09-25', category: 'Tests', tags: ['Testing'], summary: 'A short excerpt.', body: ['A real body.'], published: false };
      const created = (await write('POST', '/notes', { content: note })).json();
      assert.equal((await app.inject('/api/notes/verification-note')).statusCode, 404);
      const published = await write('PUT', `/notes/${created.id}`, { version: created.version, content: { ...note, published: true } }); assert.equal(published.statusCode, 200, published.body);
      assert.deepEqual((await app.inject('/api/notes/verification-note')).json().body, note.body);
      assert.equal((await write('PUT', `/notes/${created.id}`, { version: published.json().version, content: note })).statusCode, 200);
      assert.equal((await app.inject('/api/notes/verification-note')).statusCode, 404);
      assert.equal((await write('POST', '/notes', { content: { kind: 'external', title: 'An external reference', slug: 'external-test', summary: 'Short description', source: 'Example', externalUrl: 'https://example.com/article', myComment: 'Why it matters.', date: '2026-09-25', category: 'Tests', published: true } })).statusCode, 201);
      const current = (await read('/currently')).json().items.find((entry: { content: { label: string } }) => entry.content.label === 'Building');
      const updated = await write('PUT', `/currently/${current.id}`, { version: current.version, content: { ...current.content, text: 'A verification project', visible: true } }); assert.equal(updated.statusCode, 200);
      assert.ok((await app.inject('/api/currently')).json().items.some((entry: { label: string }) => entry.label === 'Building'));
      assert.equal((await write('PUT', `/currently/${current.id}`, { version: updated.json().version, content: { ...current.content, text: '', visible: false } })).statusCode, 200);
      assert.ok(!(await app.inject('/api/currently')).json().items.some((entry: { label: string }) => entry.label === 'Building'));
    });
    await t.test('message persists with timestamp; inbox read/unread/archive; invalid and spam requests fail', async () => {
      const submit = (payload: object) => app.inject({ method: 'POST', url: '/api/messages', headers: { origin: config.PUBLIC_ORIGIN }, payload });
      const message = { name: 'Verification visitor', email: 'visitor@example.test', subject: 'Verification', message: 'This is a persisted test message.' };
      assert.equal((await submit({ ...message, email: 'invalid' })).statusCode, 400);
      assert.equal((await submit({ ...message, website: 'spam' })).statusCode, 400);
      assert.equal((await submit(message)).statusCode, 201);
      const item = (await read('/messages')).json().items[0]; assert.equal(item.status, 'unread'); assert.ok(Date.parse(item.createdAt));
      assert.equal((await read(`/messages/${item.id}`)).json().message, message.message);
      for (const status of ['read', 'unread', 'archived']) { assert.equal((await write('PATCH', `/messages/${item.id}`, { status })).statusCode, 200); assert.equal((await read(`/messages/${item.id}`)).json().status, status); }
      await submit(message); await submit(message); assert.equal((await submit(message)).statusCode, 429);
    });
    await t.test('expired sessions, logout, disabled accounts and password reset invalidate access', async () => {
      await db.query("UPDATE admin_sessions SET expires_at=now()-interval '1 second'"); assert.equal((await read('/overview')).statusCode, 401);
      let response = await login(); cookie = String(response.headers['set-cookie']).split(';')[0]; csrf = response.json().csrfToken;
      assert.equal((await write('POST', '/auth/logout')).statusCode, 200); assert.equal((await read('/overview')).statusCode, 401);
      await manageAccount(db, 'disable', email); assert.equal((await login()).statusCode, 401);
      await manageAccount(db, 'enable', email); response = await login(); assert.equal(response.statusCode, 200); cookie = String(response.headers['set-cookie']).split(';')[0];
      await manageAccount(db, 'password', email, randomUUID()); assert.equal((await read('/overview')).statusCode, 401);
      await manageAccount(db, 'remove', email); assert.equal((await db.query('SELECT * FROM admin_users')).rowCount, 0);
    });
    await t.test('production cookie is Secure and repeated failed logins are rate limited', async () => {
      await db.query('DELETE FROM rate_limits'); await manageAccount(db, 'create', email, password);
      const prod = await buildApp({ ...config, NODE_ENV: 'production', ADMIN_ORIGIN: 'https://admin.example.test', PUBLIC_ORIGIN: 'https://example.test', API_ORIGIN: 'https://api.example.test' }, db);
      const response = await prod.inject({ method: 'POST', url: '/api/admin/auth/login', headers: { origin: 'https://admin.example.test' }, payload: { email, password } });
      assert.match(String(response.headers['set-cookie']), /__Host-bw_admin=/); assert.match(String(response.headers['set-cookie']), /; Secure/);
      await prod.close(); await db.query('DELETE FROM rate_limits');
      for (let i = 0; i < 10; i++) assert.equal((await login('rate@example.test')).statusCode, 401);
      assert.equal((await login('rate@example.test')).statusCode, 429);
    });
  } finally {
    await app.close(); await db.end(); await source.query(`DROP DATABASE ${name} WITH (FORCE)`); await source.end();
    await fs.rm(config.MEDIA_DIR, { recursive: true, force: true });
  }
});
