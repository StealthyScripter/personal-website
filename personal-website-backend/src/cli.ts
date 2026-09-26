import { getConfig } from './config.js';
import { database, migrate } from './db.js';
import { seed } from './seed.js';
import { manageAccount } from './accounts.js';

async function readPassword() {
  if (process.argv.includes('--password-stdin')) {
    let value = ''; for await (const chunk of process.stdin) value += chunk;
    return value.replace(/\r?\n$/, '');
  }
  if (!process.stdin.isTTY) throw new Error('Use an interactive terminal or --password-stdin. Never pass passwords as command arguments.');
  process.stderr.write('Password (at least 14 characters; hidden): ');
  process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8');
  return new Promise<string>((resolve, reject) => {
    let value = '';
    const finish = () => { process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off('data', listener); process.stderr.write('\n'); };
    const listener = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\u0003') { finish(); reject(new Error('Cancelled.')); return; }
        if (char === '\r' || char === '\n') { finish(); resolve(value); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1); else if (char >= ' ') value += char;
      }
    };
    process.stdin.on('data', listener);
  });
}
const config = getConfig();
const db = database(config.DATABASE_URL);
try {
  const [, , command, action, email] = process.argv;
  if (command === 'migrate') { await migrate(db); console.log('Migrations applied.'); }
  else if (command === 'seed') { await seed(db, config); console.log('Seed imported without overwriting existing content.'); }
  else if (command === 'admin') console.log(await manageAccount(db, action, email, ['create', 'password'].includes(action) ? await readPassword() : undefined));
  else if (command === 'prune') { await db.query('DELETE FROM admin_sessions WHERE expires_at<now()'); await db.query('DELETE FROM rate_limits WHERE expires_at<now()'); console.log('Expired sessions and rate limits removed.'); }
  else throw new Error('Use migrate, seed, admin, or prune.');
} finally { await db.end(); }
