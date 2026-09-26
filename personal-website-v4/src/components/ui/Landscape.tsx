// Decorative, code-native illustration. No implied place or personal photograph.
export function Landscape() {
  return <div className="landscape" aria-hidden="true">
    <svg viewBox="0 0 420 420" fill="none" focusable="false">
      <defs>
        <linearGradient id="sky" x1="210" y1="0" x2="210" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="var(--landscape-sky)" /><stop offset="1" stopColor="var(--landscape-ground)" /></linearGradient>
        <linearGradient id="hill" x1="0" y1="220" x2="420" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="var(--landscape-hill)" /><stop offset="1" stopColor="var(--landscape-dark)" /></linearGradient>
        <clipPath id="landscape-clip"><rect width="420" height="420" rx="210" /></clipPath>
      </defs>
      <g clipPath="url(#landscape-clip)">
        <path fill="url(#sky)" d="M0 0h420v420H0z" />
        <circle cx="279" cy="118" r="39" fill="var(--landscape-sun)" />
        <path d="M-35 278C46 203 97 251 166 232c103-29 149-41 291 58v160H-35Z" fill="var(--landscape-far)" />
        <path d="M-20 320c99-143 170-91 249-24 89 75 151 18 218-1v161H-20Z" fill="url(#hill)" />
        <path d="M-14 376c95-18 169-23 230-2 64 21 136 11 223-44" stroke="var(--landscape-line)" strokeWidth="1" />
        <path d="M-14 389c95-18 169-23 230-2 64 21 136 11 223-44" stroke="var(--landscape-line)" strokeWidth="1" />
        <path d="M-14 402c95-18 169-23 230-2 64 21 136 11 223-44" stroke="var(--landscape-line)" strokeWidth="1" />
        <path d="M-14 415c95-18 169-23 230-2 64 21 136 11 223-44" stroke="var(--landscape-line)" strokeWidth="1" />
      </g>
      <circle cx="210" cy="210" r="209.5" stroke="var(--border)" />
      <path d="m67 91 4-6 4 6m-4-6v23m261 225v20m-10-10h20" stroke="var(--landscape-line)" />
    </svg>
    <span className="landscape-caption">Always a little more to explore.</span>
  </div>;
}
