import { useEffect, useState } from 'react';
import { api, allItems, setCsrf, type EditorContent, type Entry, type Media } from './api';
import { Editor } from './Editor';
import { Feedback, Field } from './fields';
import { Currently, Inbox, MediaLibrary, Settings } from './Management';

type User = { id: string; email: string };
type Session = { user: User; csrfToken: string };
const sections = ['Overview', 'Projects', 'Notes', 'Currently', 'Inbox', 'Media', 'Settings'] as const;
type Section = typeof sections[number];

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('Overview');
  const [error, setError] = useState('');
  function signedIn(session: Session) { setCsrf(session.csrfToken); setUser(session.user); setError(''); }
  useEffect(() => {
    api<Session>('/auth/me').then(signedIn).catch(() => {}).finally(() => setLoading(false));
    const expired = () => { setCsrf(''); setUser(null); };
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (loading) return <main><p role="status">Checking your session…</p></main>;
  if (!user) return <Login onSuccess={signedIn} />;
  return <><header><a className="identity" href="#main">Personal site · Admin</a><span>{user.email}</span><button className="quiet" onClick={async () => { try { await api('/auth/logout', 'POST'); setCsrf(''); setUser(null); } catch (error) { setError((error as Error).message); } }}>Sign out</button></header>
    <nav aria-label="Administration">{sections.map((item) => <button key={item} aria-current={item === section ? 'page' : undefined} onClick={() => setSection(item)}>{item}</button>)}</nav>
    <main id="main"><h1>{section}</h1><Feedback error={error} />
      {section === 'Overview' && <Overview />}
      {(section === 'Projects' || section === 'Notes') && <Collection key={section} collection={section === 'Projects' ? 'projects' : 'notes'} />}
      {section === 'Currently' && <Currently />}{section === 'Inbox' && <Inbox />}{section === 'Media' && <MediaLibrary />}{section === 'Settings' && <Settings />}
    </main></>;
}

function Login({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  return <main className="login"><p className="eyebrow">Personal site administration</p><h1>Sign in</h1><form onSubmit={async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { onSuccess(await api<Session>('/auth/login', 'POST', { email, password })); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }}><label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><Feedback error={error} /><button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></main>;
}

function Overview() {
  const [data, setData] = useState<{ content: { kind: string; total: number; published: number }[]; messages: { total: number; unread: number } }>();
  const [error, setError] = useState('');
  useEffect(() => { api<NonNullable<typeof data>>('/overview').then(setData).catch((error) => setError(error.message)); }, []);
  return <><Feedback error={error} />{data ? <div className="cards">{data.content.map((item) => <article key={item.kind}><h2>{item.kind}</h2><p>{item.total} entries · {item.published} public</p></article>)}<article><h2>Inbox</h2><p>{data.messages.unread} unread · {data.messages.total} messages</p></article></div> : !error && <p role="status">Loading overview…</p>}</>;
}

function Collection({ collection }: { collection: 'projects' | 'notes' }) {
  const [entries, setEntries] = useState<Entry<EditorContent>[]>([]); const [media, setMedia] = useState<Media[]>([]);
  const [editing, setEditing] = useState<Entry<EditorContent> | 'new' | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [query, setQuery] = useState('');
  useEffect(() => {
    Promise.all([allItems<Entry<EditorContent>>(`/${collection}`), allItems<Media>('/media')]).then(([items, assets]) => { setEntries(items); setMedia(assets); }).catch((error) => setError(error.message)).finally(() => setLoading(false));
  }, [collection]);
  if (editing) return <Editor collection={collection} initial={editing === 'new' ? undefined : editing} media={media} onUpload={(asset) => setMedia((items) => [asset, ...items])} onClose={() => setEditing(null)} onSaved={(entry) => setEntries((items) => [entry, ...items.filter((item) => item.id !== entry.id)])} />;
  return <><div className="toolbar"><button onClick={() => setEditing('new')}>Create {collection === 'projects' ? 'project' : 'note'}</button><Field label="Search entries" value={query} onChange={setQuery} /></div><Feedback error={error} />{loading && <p role="status">Loading entries…</p>}{!loading && !entries.length && <p>No entries yet. Create a draft to get started.</p>}
    <div className="entry-list">{entries.filter((entry) => entry.content.title.toLowerCase().includes(query.toLowerCase())).map((entry) => <article key={entry.id}><div><h2>{entry.content.title}</h2><p>{entry.content.published ? 'Published' : 'Draft'} · /{entry.content.slug}</p></div><div className="row-actions"><button className="quiet" onClick={() => setEditing(entry)}>Edit <span className="sr-only">{entry.content.title}</span></button><button className="quiet danger" onClick={async () => { if (!window.confirm(`Delete “${entry.content.title}”? This cannot be undone.`)) return; try { await api(`/${collection}/${entry.id}?version=${entry.version}`, 'DELETE'); setEntries((items) => items.filter((item) => item.id !== entry.id)); } catch (error) { setError((error as Error).message); } }}>Delete <span className="sr-only">{entry.content.title}</span></button></div></article>)}</div></>;
}
