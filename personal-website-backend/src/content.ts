import { randomUUID } from 'node:crypto';
import { withMediaLock, type Database } from './db.js';
import { collectionSchemas, type Kind } from './schemas.js';
import { validateMediaReferences } from './media.js';
import { HttpError } from './errors.js';

export function contentDto(row: Record<string, unknown>) { return { id: row.id, version: row.version, createdAt: row.created_at, modifiedAt: row.updated_at, content: row.content }; }
export async function saveContent(db: Database, kind: Kind, input: unknown, id?: string, version?: number) {
  const content = collectionSchemas[kind].parse(input);
  return withMediaLock(db, async (client) => {
  await validateMediaReferences(client, content);
  if (!id) {
    const result = await client.query('INSERT INTO content_items(id,kind,content) VALUES($1,$2,$3) RETURNING *', [randomUUID(), kind, JSON.stringify(content)]);
    return contentDto(result.rows[0]);
  }
  const result = await client.query('UPDATE content_items SET content=$1,version=version+1,updated_at=now() WHERE id=$2 AND kind=$3 AND version=$4 RETURNING *', [JSON.stringify(content), id, kind, version]);
  if (!result.rowCount) throw new HttpError(409, 'This entry changed or was removed. Reload before saving.');
  return contentDto(result.rows[0]);
  });
}
