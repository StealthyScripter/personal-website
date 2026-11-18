import type { Database } from './db.js';
import { settingsSchema } from './schemas.js';

// Explicit editorial update, never a runtime fallback or an automatic startup seed.
// Identity, contact details and social links stay in the existing settings record.
export async function refinePortfolioCopy(db: Database) {
  const result = await db.query('SELECT content,version FROM site_settings WHERE id=1');
  if (!result.rowCount) throw new Error('Configure site settings before applying the portfolio copy update.');
  const { content: previous, version } = result.rows[0];
  const content = settingsSchema.parse({
    ...previous,
    description: `Explore the portfolio of ${previous.name}, a Computer Science graduate interested in software development, research, healthcare technology, and meaningful digital innovation.`,
    hero: {
      eyebrow: 'A PERSONAL CORNER OF THE INTERNET',
      thought: 'Exploring ideas. Building solutions. Creating impact.',
      introduction: "I'm a Computer Science graduate interested in software development, research, and the potential of technology to solve meaningful problems.\n\nI'm particularly drawn to opportunities at the intersection of computing and healthcare, where thoughtful innovation can improve systems, support better decision-making, and contribute to more effective healthcare delivery.",
    },
    about: [
      'I am a Computer Science graduate with a strong interest in software development, problem-solving, and the application of technology to real-world challenges.',
      'My background in computing has shaped how I approach problems: with curiosity, analytical thinking, and an appreciation for solutions that are both practical and thoughtfully designed. I enjoy exploring ideas, understanding how systems work, and building applications that address meaningful needs.',
      'Beyond software development, I have a particular interest in healthcare technology and interdisciplinary research. I am drawn to the potential of computing, data, and digital innovation to improve healthcare systems, support informed decision-making, and enhance the delivery of care.',
      'I am especially interested in how technology can help bridge gaps in healthcare accessibility, efficiency, and quality. As I continue to grow professionally, I hope to explore opportunities that bring together technical expertise, research, and human-centered innovation.',
      'This portfolio is a collection of my projects, ideas, and ongoing learning, reflecting both the work I have done and the directions I hope to explore.',
    ],
  });
  const updated = await db.query('UPDATE site_settings SET content=$1,version=version+1,updated_at=now() WHERE id=1 AND version=$2 AND content IS DISTINCT FROM $1::jsonb RETURNING version', [JSON.stringify(content), version]);
  if (!updated.rowCount) {
    const current = await db.query('SELECT version FROM site_settings WHERE id=1');
    if (current.rows[0]?.version !== version) throw new Error('Settings changed during the copy update. Review them before retrying.');
  }
}
