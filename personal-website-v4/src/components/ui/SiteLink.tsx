import type { ComponentProps } from 'react';
import { basePath } from '@/lib/urls';

// Static HTML navigation works on every file host, without RSC payload rewrites
// or platform-dependent segment-prefetch paths. It also works without JS.
export default function SiteLink({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  return <a {...props} href={href.startsWith('/') ? `${basePath}${href}` : href} />;
}
