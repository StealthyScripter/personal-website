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
  demoLink = "#", 
  githubLink = "#" 
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
          <a href={demoLink} className="project-link">Live Demo</a>
          <a href={githubLink} className="project-link">GitHub</a>
        </div>
      </div>
    </div>
  );
}
