export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={`brand-mark ${className}`} width="38" height="20" viewBox="-2 -2 310 160" aria-hidden="true" focusable="false"><path fill="var(--brand-sage)" d="M0 0h50l73 115-26 39Z" /><path fill="var(--brand-mark-foreground)" d="M104 0h50l71 115-27 39Z" /><path fill="none" stroke="var(--brand-mark-foreground)" strokeWidth="2" d="m224 115 80-115" /></svg>;
}
