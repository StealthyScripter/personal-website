import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Config } from './config.js';
import { audit, withMediaLock, type Database } from './db.js';
import { authenticate, authorize, cookieName, csrfToken, hashPassword, issueSession, rateLimit, requireOrigin, session, tokenHash } from './auth.js';
import { contentDto, saveContent } from './content.js';
import { loginSchema, messageSchema, settingsSchema, type Kind } from './schemas.js';
import { mediaDto, mediaReferenced, saveMedia, storageFor, type Storage } from './media.js';
import { HttpError } from './errors.js';

declare module 'fastify' { interface FastifyRequest { adminId: string } }
const idParam = z.object({ id: z.uuid() });
const writeBody = z.strictObject({ content: z.unknown(), version: z.number().int().positive().optional() });
const paging = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50), offset: z.coerce.number().int().min(0).max(100000).default(0) });

export async function buildApp(config: Config, db: Database, storage: Storage = storageFor(config)) {
  const app = Fastify({ bodyLimit: 256 * 1024, trustProxy: config.TRUST_PROXY ? config.TRUST_PROXY.split(',') : false,
    logger: config.NODE_ENV === 'test' ? false : { level: 'info', redact: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-csrf-token"]', 'res.headers["set-cookie"]'] } });
  await app.register(cookie);
  await app.register(cors, { origin: [config.PUBLIC_ORIGIN, config.ADMIN_ORIGIN], credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'X-CSRF-Token'] });
  await app.register(helmet, { crossOriginResourcePolicy: { policy: 'cross-origin' } });
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 0, parts: 1 } });
  app.decorateRequest('adminId', '');
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (request.url.startsWith('/api/admin')) reply.header('X-Robots-Tag', 'noindex, nofollow');
    if (request.method !== 'OPTIONS' && request.url !== '/health') await rateLimit(db, config, `all:${request.ip}`, 300, 60);
  });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) return reply.code(400).send({ error: 'Please check the submitted fields.', fields: z.flattenError(error).fieldErrors });
    const code = (error as { code?: string }).code;
    if (code === '23505') return reply.code(409).send({ error: 'That slug or label is already in use.' });
    const status = error instanceof HttpError ? error.statusCode : (error as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) return reply.code(status).send({ error: error instanceof HttpError ? error.message : status === 413 ? 'The request is too large.' : 'The request could not be accepted.' });
    request.log.error({ code: code || 'INTERNAL_ERROR', requestId: request.id }, 'Request failed');
    return reply.code(500).send({ error: 'Something went wrong. Please try again later.' });
  });
  app.get('/health', async () => { await db.query('SELECT 1'); return { status: 'ok' }; });
  for (const [route, kind] of [['projects', 'project'], ['notes', 'note'], ['currently', 'currently']] as const) {
    app.get(`/api/${route}`, async (request) => {
      const { limit, offset } = paging.parse(request.query);
      const result = await db.query(`SELECT content FROM content_items WHERE kind=$1 AND published=true ORDER BY ${kind === 'note' ? "content->>'date' DESC," : ''} sort_order,created_at LIMIT $2 OFFSET $3`, [kind, limit, offset]);
      return { items: result.rows.map((row) => row.content) };
    });
    if (kind !== 'currently') app.get(`/api/${route}/:slug`, async (request) => {
      const { slug } = z.object({ slug: z.string().max(100) }).parse(request.params);
      const result = await db.query('SELECT content FROM content_items WHERE kind=$1 AND slug=$2 AND published=true', [kind, slug]);
      if (!result.rowCount) throw new HttpError(404, 'Not found.');
      return result.rows[0].content;
    });
  }
  app.get('/api/settings', async () => { const result = await db.query('SELECT content FROM site_settings WHERE id=1'); if (!result.rowCount) throw new HttpError(503, 'Site content is not configured yet.'); return result.rows[0].content; });
  app.post('/api/messages', async (request, reply) => {
    requireOrigin(request, [config.PUBLIC_ORIGIN]);
    await rateLimit(db, config, `message:${request.ip}`, 5, 900);
    const input = messageSchema.parse(request.body);
    if (input.website) throw new HttpError(400, 'The message could not be accepted.');
    const id = randomUUID();
    await db.query('INSERT INTO messages(id,name,email,subject,message) VALUES($1,$2,$3,$4,$5)', [id, input.name, input.email, input.subject, input.message]);
    return reply.code(201).send({ accepted: true });
  });
  const dummyHash = await hashPassword(randomBytes(32).toString('hex'));
  app.post('/api/admin/auth/login', async (request, reply) => {
    requireOrigin(request, [config.ADMIN_ORIGIN]);
    await rateLimit(db, config, `login-ip:${request.ip}`, 10, 900);
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) throw new HttpError(401, 'Invalid email or password.');
    await rateLimit(db, config, `login-account:${parsed.data.email}`, 10, 900);
    const user = await authenticate(parsed.data.email, parsed.data.password, db, dummyHash);
    const csrf = await issueSession(user.id, reply, db, config);
    await audit(db, user.id, 'login');
    return { user, csrfToken: csrf };
  });
  await app.register(async (admin) => {
    admin.addHook('onRequest', async (request) => { const user = await authorize(request, db, config); request.adminId = user.id; });
    admin.get('/auth/me', async (request) => { const user = (await session(request, db, config))!; return { user: { id: user.id, email: user.email }, csrfToken: csrfToken(user.token, config) }; });
    admin.post('/auth/logout', async (request, reply) => {
      await db.query('DELETE FROM admin_sessions WHERE token_hash=$1', [tokenHash(request.cookies[cookieName(config)]!)]);
      reply.clearCookie(cookieName(config), { path: '/', secure: config.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict' });
      return { ok: true };
    });
    admin.get('/overview', async () => {
      const content = await db.query('SELECT kind,count(*)::int AS total,count(*) FILTER(WHERE published)::int AS published FROM content_items GROUP BY kind');
      const messages = await db.query("SELECT count(*)::int AS total,count(*) FILTER(WHERE status='unread')::int AS unread FROM messages");
      return { content: content.rows, messages: messages.rows[0] };
    });
    for (const [route, kind] of [['projects', 'project'], ['notes', 'note'], ['currently', 'currently']] as [string, Kind][]) {
      admin.get(`/${route}`, async (request) => { const { limit, offset } = paging.parse(request.query); const result = await db.query('SELECT * FROM content_items WHERE kind=$1 ORDER BY sort_order,created_at LIMIT $2 OFFSET $3', [kind, limit, offset]); return { items: result.rows.map(contentDto) }; });
      admin.get(`/${route}/:id`, async (request) => { const { id } = idParam.parse(request.params); const result = await db.query('SELECT * FROM content_items WHERE kind=$1 AND id=$2', [kind, id]); if (!result.rowCount) throw new HttpError(404, 'Not found.'); return contentDto(result.rows[0]); });
      admin.post(`/${route}`, async (request, reply) => { const { content } = writeBody.parse(request.body); const saved = await saveContent(db, kind, content); await audit(db, request.adminId, `${kind}.create`, String(saved.id)); return reply.code(201).send(saved); });
      admin.put(`/${route}/:id`, async (request) => { const { id } = idParam.parse(request.params); const { content, version } = writeBody.parse(request.body); if (!version) throw new HttpError(400, 'Version is required.'); const saved = await saveContent(db, kind, content, id, version); await audit(db, request.adminId, `${kind}.update`, id); return saved; });
      admin.delete(`/${route}/:id`, async (request, reply) => { const { id } = idParam.parse(request.params); const { version } = z.object({ version: z.coerce.number().int().positive() }).parse(request.query); const result = await db.query('DELETE FROM content_items WHERE kind=$1 AND id=$2 AND version=$3', [kind, id, version]); if (!result.rowCount) throw new HttpError(409, 'This entry changed or was removed. Reload first.'); await audit(db, request.adminId, `${kind}.delete`, id); return reply.code(204).send(); });
    }
    admin.get('/messages', async (request) => { const { limit, offset } = paging.parse(request.query); const result = await db.query('SELECT id,name,subject,left(message,140) AS preview,status,created_at AS "createdAt",read_at AS "readAt" FROM messages ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]); return { items: result.rows }; });
    admin.get('/messages/:id', async (request) => { const { id } = idParam.parse(request.params); const result = await db.query('SELECT id,name,email,subject,message,status,created_at AS "createdAt",read_at AS "readAt" FROM messages WHERE id=$1', [id]); if (!result.rowCount) throw new HttpError(404, 'Not found.'); return result.rows[0]; });
    admin.patch('/messages/:id', async (request) => { const { id } = idParam.parse(request.params); const { status } = z.strictObject({ status: z.enum(['unread', 'read', 'archived']) }).parse(request.body); const result = await db.query("UPDATE messages SET status=$1,read_at=CASE WHEN $1='read' THEN coalesce(read_at,now()) WHEN $1='unread' THEN NULL ELSE read_at END WHERE id=$2 RETURNING id,status", [status, id]); if (!result.rowCount) throw new HttpError(404, 'Not found.'); return result.rows[0]; });
    admin.get('/media', async (request) => { const { limit, offset } = paging.parse(request.query); const result = await db.query('SELECT * FROM media_assets ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]); return { items: result.rows.map(mediaDto) }; });
    admin.post('/media', async (request, reply) => { await rateLimit(db, config, `upload:${request.adminId}`, 30, 300); const file = await request.file(); if (!file) throw new HttpError(400, 'Choose a file.'); const bytes = await file.toBuffer(); const saved = await saveMedia(db, storage, bytes, file.filename, file.mimetype); await audit(db, request.adminId, 'media.create', String(saved.id)); return reply.code(201).send(saved); });
    admin.delete('/media/:id', async (request, reply) => {
      const { id } = idParam.parse(request.params);
      await withMediaLock(db, async (client) => {
        if (await mediaReferenced(client, id, false)) throw new HttpError(409, 'This media is used by content. Remove its references first.');
        const result = await client.query('SELECT storage_key FROM media_assets WHERE id=$1', [id]);
        if (!result.rowCount) throw new HttpError(404, 'Not found.');
        await storage.delete(result.rows[0].storage_key);
        await client.query('DELETE FROM media_assets WHERE id=$1', [id]);
      });
      await audit(db, request.adminId, 'media.delete', id);
      return reply.code(204).send();
    });
    admin.get('/settings', async () => { const result = await db.query('SELECT content,version FROM site_settings WHERE id=1'); return result.rows[0] || { content: null, version: 0 }; });
    admin.put('/settings', async (request) => { const body = z.strictObject({ content: settingsSchema, version: z.number().int().min(0) }).parse(request.body); const result = await db.query('UPDATE site_settings SET content=$1,version=version+1,updated_at=now() WHERE id=1 AND version=$2 RETURNING content,version', [JSON.stringify(body.content), body.version]); if (!result.rowCount) throw new HttpError(409, 'Settings changed. Reload first.'); await audit(db, request.adminId, 'settings.update'); return result.rows[0]; });
  }, { prefix: '/api/admin' });
  app.get('/api/media/:id/file', async (request, reply) => {
    const { id } = idParam.parse(request.params);
    if (!(await mediaReferenced(db, id, true))) {
      if (request.headers.origin && request.headers.origin !== config.ADMIN_ORIGIN) throw new HttpError(404, 'Not found.');
      if (!(await session(request, db, config))) throw new HttpError(404, 'Not found.');
    }
    const result = await db.query('SELECT * FROM media_assets WHERE id=$1', [id]);
    if (!result.rowCount) throw new HttpError(404, 'Not found.');
    const media = result.rows[0];
    reply.type(media.mime_type).header('Accept-Ranges', 'bytes').header('Content-Disposition', 'inline');
    const match = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let range;
    if (request.headers.range) {
      if (!match) throw new HttpError(416, 'Unsupported range.');
      range = { start: Number(match[1]), end: match[2] ? Math.min(Number(match[2]), media.bytes - 1) : media.bytes - 1 };
      if (range.start > range.end || range.start >= media.bytes) throw new HttpError(416, 'Unsupported range.');
      reply.code(206).header('Content-Range', `bytes ${range.start}-${range.end}/${media.bytes}`).header('Content-Length', range.end - range.start + 1);
    } else reply.header('Content-Length', media.bytes);
    return reply.send(await storage.get(media.storage_key, range));
  });
  return app;
}
