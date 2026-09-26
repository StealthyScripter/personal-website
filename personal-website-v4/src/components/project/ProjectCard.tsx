import Image from 'next/image';
import Link from '@/components/ui/SiteLink';
import type { Project } from '@/lib/content/schema';
import { assetUrl } from '@/lib/urls';
import { Arrow } from '@/components/ui/Arrow';

export function ProjectStatus({ status }: { status?: Project['status'] }) {
  return <span className={`status status-${(status || 'unspecified').toLowerCase().replaceAll(' ', '-')}`}><span aria-hidden="true" />{status || 'Status to be added'}</span>;
}

export function ProjectCard({ project, headingAs = 'h3' }: { project: Project; headingAs?: 'h2' | 'h3' }) {
  const Heading = headingAs;
  return <article className="project-card">
    <Link href={`/projects/${project.slug}/`} className="project-card-link">
      <div className="project-cover"><Image src={assetUrl(project.coverImage.src)} alt={project.coverImage.alt} width={project.coverImage.width} height={project.coverImage.height} sizes="(max-width: 700px) 92vw, (max-width: 1000px) 44vw, 360px" /><span className="cover-label">Project preview</span></div>
      <div className="project-card-copy">
        <ProjectStatus status={project.status} />
        <Heading>{project.title}<Arrow /></Heading>
        <p>{project.summary}</p>
      </div>
    </Link>
  </article>;
}
