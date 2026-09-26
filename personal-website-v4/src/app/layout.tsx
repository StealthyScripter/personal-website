import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { site } from '@/content/site';
import { assetUrl } from '@/lib/urls';
import { getSettings } from '@/lib/content';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  icons: {
    icon: [{ url: assetUrl('/favicon.svg'), type: 'image/svg+xml' }, { url: assetUrl('/favicon-32x32.png'), sizes: '32x32', type: 'image/png' }, { url: assetUrl('/favicon-16x16.png'), sizes: '16x16', type: 'image/png' }],
    shortcut: assetUrl('/favicon.ico'), apple: assetUrl('/apple-touch-icon.png'),
  },
};

// Runs before first paint. Default is light; storage denial is harmless.
const themeScript = `(function(){try{var t=localStorage.getItem('bw-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings().catch(() => null);
  return <html lang="en" data-theme="light" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header name={settings?.name || site.name} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer name={settings?.name || site.name} github={settings?.social.find((item) => item.label === 'GitHub')?.url} />
    </body>
  </html>;
}
