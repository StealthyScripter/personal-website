'use client';
export default function ContentError({ reset }: { reset: () => void }) { return <div className="container page-shell"><h1>A small interruption.</h1><p>Content is temporarily unavailable. Please try again shortly.</p><button className="button button-primary" onClick={reset}>Try again</button></div>; }
