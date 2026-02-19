'use client'
import ProjectCard from './ProjectCard';
import { projectsData } from '@/services/FetchData';
import { useReveal } from '@/hooks/useReveal';

export default function Projects() {
  const sectionRef = useReveal();

  return (
    <section id="projects" ref={sectionRef as React.RefObject<HTMLElement>} className="reveal">
      <div className="section-label">Portfolio</div>
      <h2 className="section-title">Featured <span className="accent">Projects</span></h2>
      <p className="section-subtitle">
        A showcase of innovative solutions and creative implementations
      </p>
      <div className="projects-grid">
        {projectsData.map((project) => (
          <ProjectCard
            key={project.title}
            title={project.title}
            description={project.description}
            image={project.image}
            technologies={project.technologies}
            demoLink={project.demoLink}
            githubLink={project.githubLink}
          />
        ))}
      </div>
    </section>
  );
}
