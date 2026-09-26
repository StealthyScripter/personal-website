import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('127.0.0.1'),
  PUBLIC_ORIGIN: z.url().default('http://localhost:3000'),
  ADMIN_ORIGIN: z.url().default('http://localhost:5173'),
  API_ORIGIN: z.url().default('http://localhost:4000'),
  SECURITY_SECRET: z.string().min(32),
  SESSION_HOURS: z.coerce.number().positive().max(24).default(8),
  TRUST_PROXY: z.string().default(''),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  MEDIA_DIR: z.string().default('.local/media'),
  S3_BUCKET: z.string().optional(), S3_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.url().optional(),
});

export type Config = z.infer<typeof envSchema>;
export function getConfig(env = process.env): Config {
  const c = envSchema.parse(env);
  for (const key of ['PUBLIC_ORIGIN', 'ADMIN_ORIGIN', 'API_ORIGIN'] as const) {
    if (new URL(c[key]).origin !== c[key]) throw new Error(`${key} must be an origin without a path or trailing slash`);
    if (c.NODE_ENV === 'production' && !c[key].startsWith('https://')) throw new Error(`${key} requires HTTPS in production`);
  }
  if (c.STORAGE_DRIVER === 's3' && !c.S3_BUCKET) throw new Error('S3_BUCKET is required for S3 storage');
  return c;
}
