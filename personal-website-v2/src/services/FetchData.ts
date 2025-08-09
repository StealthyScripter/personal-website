type SkillCategory = "frontend" | "backend" | "devops";

interface Skill {
  name: string;
  category: SkillCategory;
}

export const skillsData: Skill[] = [
  // Frontend Skills
  { name: "React", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Three.js", category: "frontend" },
  {name: "Angular", category:"frontend"},

  // Backend Skills
  { name: "Node.js", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "PostgreSQL", category: "backend" },
  { name: "MongoDB", category: "backend" },

  // DevOps Skills
  { name: "Docker", category: "devops" },
  { name: "AWS", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "Vercel", category: "devops" },
];

// Project types
interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink?: string;
  githubLink?: string;
}

export const projectsData: Project[] = [
  {
    title: "Phone Calling App",
    description:
      "A full-stack phone calling app to connect local US call internationally",
    image: "E-Commerce Platform",
    technologies: ["React Native", "Node.js", "PostgreSQL", "Stripe", "Twilio", "Redis"],
    demoLink: "https://x.com/wendotbrian", 
    githubLink:"https://x.com/wendotbrian", 
  },
  {
    title: "AI Trading Analytics Dashboard",
    description:
      "Interactive dashboard for data visualization with machine learning insights, real-time analytics, and predictive modeling capabilities.",
    image: "AI Dashboard",
    technologies: ["Python", "Typescript", "TensorFlow", "Javascript"],
    demoLink: undefined, 
    githubLink:"https://github.com/StealthyScripter/TradingSystem.git", 
  },
  {
    title: "Social Collaboration Tool",
    description:
      "Cross-platform mobile application for team collaboration with real-time messaging, file sharing, and project management features.",
    image: "Mobile App",
    technologies: ["Javascript", "Python","SQLite", "Typescript" ],
    demoLink: undefined, 
    githubLink:"https://gitlab.com/simba_ndlovu/senior-project.git", 
  },
];

export const socialLinks = [
  { name: "GitHub", url: "https://github.com/StealthyScripter" },
  { name: "LinkedIn", url: "https://linkedin.com/in/brian-koringo" },
  { name: "Twitter", url: "https://x.com/wendotbrian" },
  { name: "Email", url: "mailto:koringo.w.brian@gmail.com" }
];
