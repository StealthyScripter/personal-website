import Image from 'next/image';
import type { ContentImage, ProjectVideo } from '@/lib/content/schema';
import { assetUrl } from '@/lib/urls';
import { Arrow } from '@/components/ui/Arrow';

export function ContentFigure({ image, priority = false }: { image: ContentImage; priority?: boolean }) {
  return <figure className={`content-figure ${image.height > image.width ? 'portrait' : ''}`}>
    <div className="figure-surface"><Image src={assetUrl(image.src)} alt={image.alt} width={image.width} height={image.height} priority={priority} sizes="(max-width: 768px) 92vw, 1120px" /></div>
    {image.caption && <figcaption>{image.caption}</figcaption>}
  </figure>;
}

export function Video({ video }: { video: ProjectVideo }) {
  if (video.kind === 'external') return <figure className="project-video">
    {video.poster && <ContentFigure image={video.poster} />}
    <a className="text-link" href={video.url}>Watch video externally <Arrow external /></a>
    <figcaption>{video.caption}</figcaption>
  </figure>;
  return <figure className="project-video">
    <video controls playsInline preload="none" poster={video.poster ? assetUrl(video.poster) : undefined} aria-label={video.caption}>
      <source src={assetUrl(video.src)} />
      {video.captions && <track kind="captions" src={assetUrl(video.captions)} srcLang="en" label="English" default />}
      Your browser does not support video. <a href={assetUrl(video.src)}>Download the video</a>.
    </video>
    <figcaption>{video.caption}</figcaption>
    <details className="transcript"><summary>Read video transcript</summary><p>{video.transcript}</p></details>
  </figure>;
}
