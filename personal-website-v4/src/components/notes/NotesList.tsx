import Link from '@/components/ui/SiteLink';
import type { Note } from '@/lib/content/schema';
import { formatDate, assetUrl } from '@/lib/urls';
import Image from 'next/image';
import { Arrow } from '@/components/ui/Arrow';

export function NotesList({ notes }: { notes: Note[] }) {
  if (!notes.length) return <div className="notes-empty"><span className="empty-mark" aria-hidden="true">✳</span><div><h3>A little room for ideas.</h3><p>No notes published yet. This space is for reflections and things worth sharing.</p></div></div>;
  return <div className="notes-list">{notes.map((note) => <article className="note-row" key={note.slug}>
    <div className="note-meta"><span className="eyebrow">{note.category}</span><time dateTime={note.date}>{formatDate(note.date)}</time></div>
    <div>{note.image && <Image className="note-thumbnail" src={assetUrl(note.image.src)} alt={note.image.alt} width={note.image.width} height={note.image.height} />}
      <h3>{note.kind === 'external' ? <a href={note.externalUrl}>{note.title}<Arrow external /></a> : <Link href={`/notes/${note.slug}/`}>{note.title}<Arrow /></Link>}</h3><p>{note.summary}</p>
      {note.kind === 'external' && <><p className="note-comment">{note.myComment}</p><a className="external-source" href={note.externalUrl}>{note.source} · External link <Arrow external /></a></>}
    </div>
  </article>)}</div>;
}
