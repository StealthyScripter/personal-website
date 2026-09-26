import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Database } from './db.js';
import { hashPassword } from './auth.js';
import { passwordSchema } from './schemas.js';

export async function manageAccount(db: Database, action: string, emailInput?: string, password?: string) {
  if (action === 'list') return (await db.query('SELECT id,email,enabled,created_at FROM admin_users ORDER BY email')).rows;
  const email = z.email().parse(emailInput).toLowerCase();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if (action === 'create') {
      await client.query('INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,$3)', [randomUUID(), email, await hashPassword(passwordSchema.parse(password))]);
    } else {
      const row = (await client.query('SELECT id FROM admin_users WHERE email=$1 FOR UPDATE', [email])).rows[0];
      if (!row) throw new Error('Account not found.');
      if (action === 'remove') await client.query('DELETE FROM admin_users WHERE id=$1', [row.id]);
      else if (action === 'enable' || action === 'disable') await client.query('UPDATE admin_users SET enabled=$1 WHERE id=$2', [action === 'enable', row.id]);
      else if (action === 'password') await client.query('UPDATE admin_users SET password_hash=$1 WHERE id=$2', [await hashPassword(passwordSchema.parse(password)), row.id]);
      else throw new Error('Use create, remove, enable, disable, password, or list.');
      await client.query('DELETE FROM admin_sessions WHERE user_id=$1', [row.id]);
    }
    await client.query('INSERT INTO audit_events(id,action,entity_id) VALUES($1,$2,$3)', [randomUUID(), `cli.account.${action}`, email]);
    await client.query('COMMIT');
    return { ok: true };
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
