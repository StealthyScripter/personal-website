'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ContentImage } from '@/lib/content/schema';
import { assetUrl } from '@/lib/urls';

export function Gallery({ images }: { images: ContentImage[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  if (!current) return null;
  const move = (by: number) => setSelected((index) => (index + by + images.length) % images.length);

  return <>
    <div className="gallery-grid">{images.map((item, index) => <figure key={item.src} className={item.height > item.width ? 'gallery-portrait' : ''}>
      <button type="button" className="gallery-open" aria-label={`Enlarge image: ${item.alt}`} onClick={() => { setSelected(index); dialog.current?.showModal(); }}>
        <Image src={assetUrl(item.src)} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 700px) 90vw, 530px" /><span className="enlarge-icon" aria-hidden="true">↗</span>
      </button>{item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>)}</div>
    <dialog ref={dialog} className="gallery-dialog" aria-label="Project image viewer" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    }}>
      <div className="gallery-dialog-inner">
        <div className="gallery-toolbar"><span aria-live="polite">Image {selected + 1} of {images.length}</span><button type="button" className="text-button" onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button></div>
        <Image src={assetUrl(current.src)} alt={current.alt} width={current.width} height={current.height} sizes="90vw" />
        <div className="gallery-toolbar"><p aria-live="polite">{current.caption || current.alt}</p>{images.length > 1 && <div className="gallery-buttons"><button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Previous image">←</button><button type="button" className="icon-button" onClick={() => move(1)} aria-label="Next image">→</button></div>}</div>
      </div>
    </dialog>
  </>;
}
