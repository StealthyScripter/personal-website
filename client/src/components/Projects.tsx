import ProjectCard from './ProjectCard';

const projectsData = [
  {
    title: "Next-Gen E-Commerce Platform",
    description: "A full-stack e-commerce solution with real-time inventory management, AI-powered recommendations, and seamless payment integration.",
    image: "E-Commerce Platform",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe"]
  },
  {
    title: "AI Analytics Dashboard", 
    description: "Interactive dashboard for data visualization with machine learning insights, real-time analytics, and predictive modeling capabilities.",
    image: "AI Dashboard",
    technologies: ["Vue.js", "Python", "TensorFlow", "D3.js"]
  },
  {
    title: "Social Collaboration Tool",
    description: "Cross-platform mobile application for team collaboration with real-time messaging, file sharing, and project management features.",
    image: "Mobile App", 
    technologies: ["React Native", "Firebase", "TypeScript", "Socket.io"]
  }
];

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
          />
        ))}
      </div>
    </section>
  );
}
