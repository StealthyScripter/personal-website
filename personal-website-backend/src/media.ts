import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import type { Config } from './config.js';
import type { Database, Queryable } from './db.js';
import { HttpError } from './errors.js';

export interface Storage {
  put(key: string, data: Buffer, mime: string): Promise<void>;
  get(key: string, range?: { start: number; end: number }): Promise<Readable>;
  delete(key: string): Promise<void>;
}
export function storageFor(config: Config): Storage {
  if (config.STORAGE_DRIVER === 's3') {
    const s3 = new S3Client({ region: config.S3_REGION, endpoint: config.S3_ENDPOINT, forcePathStyle: !!config.S3_ENDPOINT });
    return {
      async put(key, data, mime) { await s3.send(new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key, Body: data, ContentType: mime })); },
      async get(key, range) { const result = await s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key, ...(range ? { Range: `bytes=${range.start}-${range.end}` } : {}) })); return result.Body as Readable; },
      async delete(key) { await s3.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: key })); },
    };
  }
  const root = path.resolve(config.MEDIA_DIR);
  const safe = (key: string) => {
    if (!/^[a-f0-9-]+\.[a-z0-9]+$/.test(key)) throw new Error('Invalid storage key');
    return path.join(root, key);
  };
  return {
    async put(key, data) { await fs.mkdir(root, { recursive: true }); await fs.writeFile(safe(key), data, { flag: 'wx' }); },
    async get(key, range) { return createReadStream(safe(key), range); },
    async delete(key) { await fs.unlink(safe(key)); },
  };
}
export async function validateUpload(buffer: Buffer, name: string, claimedMime: string) {
  if (buffer.length === 0 || buffer.length > 50 * 1024 * 1024) throw new HttpError(413, 'Choose a file smaller than 50 MB.');
  const extension = path.extname(name).toLowerCase();
  if (extension === '.vtt' && ['text/vtt', 'text/plain', 'application/octet-stream'].includes(claimedMime)) {
    if (buffer.length > 1024 * 1024 || !buffer.toString('utf8').startsWith('WEBVTT') || buffer.includes(0)) throw new HttpError(400, 'Invalid caption file.');
    return { data: buffer, mime: 'text/vtt', extension: 'vtt', width: null, height: null };
  }
  const detected = await fileTypeFromBuffer(buffer);
  const allowed: Record<string, string[]> = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'], 'image/gif': ['.gif'], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] };
  if (!detected || !allowed[detected.mime]?.includes(extension) || claimedMime !== detected.mime) throw new HttpError(400, 'File contents, extension, and MIME type must match an allowed image or video.');
  if (detected.mime.startsWith('image/')) {
    if (buffer.length > 10 * 1024 * 1024) throw new HttpError(413, 'Images must be smaller than 10 MB.');
    try {
      // Decode and re-encode to remove metadata and untrusted embedded payloads.
      const { data, info } = await sharp(buffer, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 6000, height: 6000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
      return { data, mime: 'image/webp', extension: 'webp', width: info.width, height: info.height };
    } catch { throw new HttpError(400, 'The image could not be decoded safely.'); }
  }
  return { data: buffer, mime: detected.mime, extension: detected.ext, width: null, height: null };
}
export async function saveMedia(db: Database, storage: Storage, bytes: Buffer, name: string, mime: string, id: string = randomUUID()) {
  const file = await validateUpload(bytes, name, mime);
  const key = `${id}.${file.extension}`;
  await storage.put(key, file.data, file.mime);
  try {
    const result = await db.query('INSERT INTO media_assets(id,storage_key,mime_type,bytes,width,height,original_name) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [id, key, file.mime, file.data.length, file.width, file.height, path.basename(name).slice(0, 200)]);
    return mediaDto(result.rows[0]);
  } catch (error) { await storage.delete(key); throw error; }
}
export function mediaDto(row: Record<string, unknown>) {
  return { id: row.id, url: `/api/media/${row.id}/file`, mimeType: row.mime_type, size: row.bytes, width: row.width, height: row.height, originalName: row.original_name, createdAt: row.created_at };
}
export function mediaReferences(value: unknown): string[] {
  if (typeof value === 'string') return /^\/api\/media\/[a-f0-9-]{36}\/file$/.test(value) ? [value.split('/')[3]] : [];
  if (!value || typeof value !== 'object') return [];
  return [...new Set(Object.values(value).flatMap(mediaReferences))];
}
export async function validateMediaReferences(db: Queryable, value: unknown) {
  const ids = mediaReferences(value);
  if (!ids.length) return;
  const result = await db.query('SELECT id FROM media_assets WHERE id=ANY($1::uuid[])', [ids]);
  if (result.rowCount !== ids.length) throw new HttpError(400, 'Some selected media no longer exists. Choose it again.');
}
export async function mediaReferenced(db: Queryable, id: string, publishedOnly: boolean) {
  const result = await db.query(`SELECT content FROM content_items ${publishedOnly ? 'WHERE published=true' : ''}`);
  return result.rows.some((row) => mediaReferences(row.content).includes(id));
}
