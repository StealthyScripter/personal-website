'use client';

import Link from '@/components/ui/SiteLink';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';

const navigation = ['Projects', 'Notes', 'About', 'Contact'];

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuOpen) document.querySelector<HTMLAnchorElement>('#primary-navigation a')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('bw-theme', next); } catch { /* Preference still works for this visit. */ }
  }

  return <header className="site-header container">
    <Link className="wordmark" href="/" aria-label={`${name} — Home`} onClick={() => setMenuOpen(false)}><BrandMark /><span className="brand-name">{name}<span className="wordmark-dot" aria-hidden="true">.</span></span></Link>
    <div className="header-controls">
      <nav id="primary-navigation" aria-label="Main navigation" className={menuOpen ? 'navigation is-open' : 'navigation'}>
        {navigation.map((label) => {
          const href = `${pathname === '/' ? '' : '/'}#${label.toLowerCase()}`;
          return <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>;
        })}
      </nav>
      <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label="Toggle light or dark theme" title="Toggle light or dark theme">
        <svg className="moon-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>
        <svg className="sun-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
      </button>
      <button ref={menuButton} type="button" className="menu-button" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
    </div>
  </header>;
}
