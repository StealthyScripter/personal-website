import { Algorithm, hash, verify } from '@node-rs/argon2';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Database } from './db.js';
import type { Config } from './config.js';
import { HttpError } from './errors.js';

export const hashPassword = (password: string) => hash(password, { algorithm: Algorithm.Argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
export const cookieName = (config: Config) => config.NODE_ENV === 'production' ? '__Host-bw_admin' : 'bw_admin';
export const csrfToken = (token: string, config: Config) => createHmac('sha256', config.SECURITY_SECRET).update(`csrf:${token}`).digest('hex');

export async function rateLimit(db: Database, config: Config, key: string, limit: number, seconds: number) {
  const digest = createHmac('sha256', config.SECURITY_SECRET).update(key).digest('hex');
  const result = await db.query(`INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END,
    expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+$2*interval '1 second' ELSE rate_limits.expires_at END RETURNING count`, [digest, seconds]);
  if (result.rows[0].count > limit) throw new HttpError(429, 'Please wait a little before trying again.');
}

export function requireOrigin(request: FastifyRequest, allowed: string[]) {
  if (!request.headers.origin || !allowed.includes(request.headers.origin)) throw new HttpError(403, 'Request origin is not allowed.');
}
export async function session(request: FastifyRequest, db: Database, config: Config) {
  const token = request.cookies[cookieName(config)];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await db.query(`SELECT u.id,u.email,s.expires_at FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at>now() AND u.enabled=true`, [tokenHash(token)]);
  return result.rows[0] ? { id: result.rows[0].id as string, email: result.rows[0].email as string, token, expiresAt: result.rows[0].expires_at } : null;
}
export async function authorize(request: FastifyRequest, db: Database, config: Config) {
  if (request.headers.origin) requireOrigin(request, [config.ADMIN_ORIGIN]);
  const user = await session(request, db, config);
  if (!user) throw new HttpError(401, 'Please sign in.');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    requireOrigin(request, [config.ADMIN_ORIGIN]);
    const supplied = request.headers['x-csrf-token'];
    const expected = csrfToken(user.token, config);
    if (typeof supplied !== 'string' || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new HttpError(403, 'Security token is missing or invalid. Refresh and try again.');
  }
  return user;
}

export async function authenticate(email: string, password: string, db: Database, dummyHash: string) {
  const result = await db.query('SELECT id,email,password_hash,enabled FROM admin_users WHERE email=$1', [email]);
  const account = result.rows[0];
  const valid = await verify(account?.password_hash || dummyHash, password).catch(() => false);
  if (!account || !account.enabled || !valid) throw new HttpError(401, 'Invalid email or password.');
  return { id: account.id as string, email: account.email as string };
}
export async function issueSession(id: string, reply: FastifyReply, db: Database, config: Config) {
  const token = randomBytes(32).toString('hex');
  await db.query('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+$3*interval \'1 hour\')', [tokenHash(token), id, config.SESSION_HOURS]);
  reply.setCookie(cookieName(config), token, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: config.SESSION_HOURS * 3600 });
  return csrfToken(token, config);
}
