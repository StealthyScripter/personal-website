interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink?: string;
  githubLink?: string;
}

export default function ProjectCard({ 
  title, 
  description, 
  image, 
  technologies, 
  demoLink, 
  githubLink 
}: ProjectCardProps) {
  return (
    <div className="project-card">
      <div className="project-image">{image}</div>
      <div className="project-content">
        <h3 className="project-title">{title}</h3>
        <p className="project-description">{description}</p>
        <div className="project-tech">
          {technologies.map((tech) => (
            <span key={tech} className="tech-tag">{tech}</span>
          ))}
        </div>
        <div className="project-links">
          <a 
            href={demoLink || undefined}
            className={`project-link ${!demoLink ? "disabled" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!demoLink}
            >Live Demo
          </a>
          <a
            href={githubLink || undefined}
            className={`project-link ${!githubLink ? "disabled" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!githubLink}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
