import { S3Client, HeadBucketCommand, CreateBucketCommand, DeleteBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getConfig } from '../src/config.ts';
import { database, migrate } from '../src/db.ts';
import { seed } from '../src/seed.ts';

const config = getConfig();
if (config.NODE_ENV !== 'development' || config.STORAGE_DRIVER !== 's3') throw new Error('Docker bootstrap is for S3-backed development only.');
const s3 = new S3Client({ region: config.S3_REGION, endpoint: config.S3_ENDPOINT, forcePathStyle: true });
const db = database(config.DATABASE_URL);
let client;
try {
  try { await s3.send(new HeadBucketCommand({ Bucket: config.S3_BUCKET })); }
  catch (error) {
    if (error.$metadata?.httpStatusCode !== 404) throw error;
    await s3.send(new CreateBucketCommand({ Bucket: config.S3_BUCKET }));
  }
  // No anonymous bucket policy: the existing backend mediates published/draft access.
  await s3.send(new DeleteBucketPolicyCommand({ Bucket: config.S3_BUCKET }));
  await migrate(db);
  client = await db.connect();
  await client.query('SELECT pg_advisory_lock(782433)');
  await client.query('CREATE TABLE IF NOT EXISTS docker_dev_bootstrap (id integer PRIMARY KEY CHECK(id=1), complete boolean NOT NULL)');
  const previous = await client.query('SELECT complete FROM docker_dev_bootstrap WHERE id=1');
  if (!previous.rowCount) {
    const existing = await client.query('SELECT EXISTS(SELECT 1 FROM content_items) OR EXISTS(SELECT 1 FROM site_settings) AS present');
    // Preserve pre-existing content. For a fresh database, leave a resumable marker
    // before importing, so an interrupted initial seed can finish on the next run.
    await client.query('INSERT INTO docker_dev_bootstrap(id,complete) VALUES(1,$1)', [existing.rows[0].present]);
  }
  if (!(await client.query('SELECT complete FROM docker_dev_bootstrap WHERE id=1')).rows[0].complete) {
    await seed(db, config);
    await client.query('UPDATE docker_dev_bootstrap SET complete=true WHERE id=1');
    console.log('Initial portfolio imported into the new development database.');
  }
  console.log('Development bucket, migrations and initial content are ready.');
} finally {
  if (client) { await client.query('SELECT pg_advisory_unlock(782433)'); client.release(); }
  await db.end(); s3.destroy();
}
