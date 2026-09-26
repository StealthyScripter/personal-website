import Link from '@/components/ui/SiteLink';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { formatDate } from '@/lib/urls';
import { ProjectStatus } from '@/components/project/ProjectCard';
import { ContentFigure, Video } from '@/components/project/Media';
import { Gallery } from '@/components/project/Gallery';
import { Arrow } from '@/components/ui/Arrow';


export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return pageMetadata(project.title, project.summary, `/projects/${slug}/`, project.coverImage.src);
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return <article className="container project-page">
    <Link href="/#projects" className="back-link">← All projects</Link>
    <header className="project-heading"><ProjectStatus status={project.status} /><h1>{project.title}</h1><p>{project.summary}</p>
      {(project.liveUrl || project.repositoryUrl) && <div className="project-actions">{project.liveUrl && <a href={project.liveUrl} className="button button-primary">Live project <Arrow external /></a>}{project.repositoryUrl && <a href={project.repositoryUrl} className="text-link">View source <Arrow external /></a>}</div>}
    </header>
    <ContentFigure image={project.coverImage} priority />
    <div className="project-overview"><section className="prose" aria-labelledby="overview-title"><p className="eyebrow">The idea</p><h2 id="overview-title">At a glance.</h2>{project.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <aside className="project-facts" aria-label="Project details"><div><span className="eyebrow">Project status</span><p>{project.status || 'Not yet specified'}</p></div>{project.technologies.length > 0 && <div><span className="eyebrow">Built with</span><ul className="tags">{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul></div>}{project.startedAt && <div><span className="eyebrow">Started</span><p><time dateTime={project.startedAt}>{formatDate(project.startedAt)}</time></p></div>}{project.updatedAt && <div><span className="eyebrow">Updated</span><p><time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time></p></div>}</aside>
    </div>
    {project.images.length > 0 && <section className="detail-section" aria-labelledby="gallery-title"><div className="section-heading"><h2 id="gallery-title">A closer look.</h2><span className="subtle">Select an image to explore</span></div><Gallery images={project.images} /></section>}
    {project.video && <section className="detail-section" aria-labelledby="video-title"><h2 id="video-title">See it in motion.</h2><Video video={project.video} /></section>}
    {project.features.length > 0 && <section className="detail-section" aria-labelledby="features-title"><p className="eyebrow">What it does</p><h2 id="features-title">The useful parts.</h2><div className="feature-grid">{project.features.map((feature, index) => <div className="feature" key={feature.title}><span className="feature-number">{String(index + 1).padStart(2, '0')}</span><h3>{feature.title}</h3><p>{feature.description}</p>{feature.image && <ContentFigure image={feature.image} />}</div>)}</div></section>}
    {project.story?.length && <section className="detail-section prose"><h2>Why I built it.</h2>{project.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>}
    {project.technicalDescription?.length && <section className="detail-section prose"><h2>How it works.</h2>{project.technicalDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>}
    {(project.currentStatus || project.nextSteps?.length) && <section className="detail-section prose"><h2>Where it stands.</h2>{project.currentStatus && <p>{project.currentStatus}</p>}{project.nextSteps && <><h3>What’s next</h3><ul>{project.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul></>}</section>}
    {project.openToCollaborators && <section className="collaboration-panel"><p className="eyebrow">Open to collaborators</p><h2>There’s room to build together.</h2><p>{project.collaborationDescription}</p><Link href="/#contact" className="text-link">Start a conversation <Arrow /></Link></section>}
    {project.relatedLinks.length > 0 && <section className="detail-section"><h2>Elsewhere</h2><ul className="related-links">{project.relatedLinks.map((link) => <li key={link.url}><a href={link.url}>{link.label} <Arrow external /></a></li>)}</ul></section>}
    {project.contentNote && <p className="content-note">{project.contentNote}</p>}
    <div className="end-link"><Link className="text-link" href="/#projects">Back to all projects <Arrow /></Link></div>
  </article>;
}
