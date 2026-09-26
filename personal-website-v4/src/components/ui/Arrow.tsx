export function Arrow({ external = false, className = '' }: { external?: boolean; className?: string }) {
  return <svg className={`arrow ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {external ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
  </svg>;
}
