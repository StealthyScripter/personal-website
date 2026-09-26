import Link from '@/components/ui/SiteLink';

export default function NotFound() {
  return <div className="container page-shell"><header className="page-heading"><p className="eyebrow">404 / A small detour</p><h1>Nothing here just yet.</h1><p>This page may have moved, or the link may be incomplete.</p></header><Link className="button button-primary" href="/">Back home →</Link></div>;
}
