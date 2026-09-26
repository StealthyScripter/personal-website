import Link from '@/components/ui/SiteLink';
import { notFound, permanentRedirect } from 'next/navigation';
import { getNote } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { formatDate } from '@/lib/urls';
import { ContentFigure } from '@/components/project/Media';
import { Arrow } from '@/components/ui/Arrow';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug?: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!slug?.length) return {};
  const note = slug.length === 1 ? await getNote(slug[0]) : null;
  if (!note) notFound();
  return pageMetadata(note.title, note.summary, `/notes/${note.slug}/`, note.image?.src);
}
export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.length) permanentRedirect('/#notes');
  const note = slug.length === 1 ? await getNote(slug[0]) : null;
  if (!note) notFound();
  if (note.kind === 'external') permanentRedirect(note.externalUrl);
  return <article className="container article-page"><Link href="/#notes" className="back-link">← All notes</Link><header className="page-heading"><p className="eyebrow">{note.category}</p><h1>{note.title}</h1><p>{note.summary}</p><time className="article-date" dateTime={note.date}>{formatDate(note.date)}</time></header>
    {note.image && <ContentFigure image={note.image} priority />}
    <div className="prose note-body">{note.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <div className="end-link"><Link href="/#notes" className="text-link">Back to notes <Arrow /></Link></div>
  </article>;
}
