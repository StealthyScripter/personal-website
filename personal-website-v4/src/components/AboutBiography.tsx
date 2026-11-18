'use client';

import { useId, useState } from 'react';

export function AboutBiography({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const remaining = paragraphs.slice(2);

  return <div className="prose">
    {paragraphs.slice(0, 2).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    {remaining.length > 0 && <>
      <div id={contentId} className="biography-more" hidden={!expanded}>
        {remaining.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
      <button type="button" className="text-link biography-toggle" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Show less' : 'Read more about me'} <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
      </button>
    </>}
  </div>;
}
