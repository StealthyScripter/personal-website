import ProjectCard from './ProjectCard';
import { projectsData } from '@/services/FetchData';

export default function Projects() {
  return (
    <section id="projects">
      <h2 className="section-title">Featured Projects</h2>
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
