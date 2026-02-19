type SkillCategory = "frontend" | "backend" | "devops";

interface Skill {
  name: string;
  category: SkillCategory;
}

export const skillsData: Skill[] = [
  { name: "React", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Three.js", category: "frontend" },
  { name: "Angular", category: "frontend" },

  { name: "Node.js", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "PostgreSQL", category: "backend" },
  { name: "MongoDB", category: "backend" },

  { name: "Docker", category: "devops" },
  { name: "AWS", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "Vercel", category: "devops" },
];

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
      "A full-stack phone calling application enabling local US numbers to make international calls. Features real-time call management, billing integration, and a seamless user experience.",
    image: "/images/project-phone.png",
    technologies: ["React Native", "Node.js", "PostgreSQL", "Stripe", "Twilio", "Redis"],
    demoLink: "https://x.com/wendotbrian", 
    githubLink: "https://x.com/wendotbrian", 
  },
  {
    title: "AI Trading Analytics Dashboard",
    description:
      "Interactive analytics dashboard combining real-time market data with machine learning insights. Features predictive modeling, pattern recognition, and customizable data visualizations.",
    image: "/images/project-trading.png",
    technologies: ["Python", "TypeScript", "TensorFlow", "JavaScript"],
    demoLink: undefined, 
    githubLink: "https://github.com/StealthyScripter/TradingSystem.git", 
  },
  {
    title: "Social Collaboration Tool",
    description:
      "Cross-platform team collaboration app with real-time messaging, file sharing, task boards, and project management. Built for distributed teams to stay connected and productive.",
    image: "/images/project-collab.png",
    technologies: ["JavaScript", "Python", "SQLite", "TypeScript"],
    demoLink: undefined, 
    githubLink: "https://gitlab.com/simba_ndlovu/senior-project.git", 
  },
];

export const socialLinks = [
  { name: "GitHub", url: "https://github.com/StealthyScripter" },
  { name: "LinkedIn", url: "https://linkedin.com/in/brian-koringo" },
  { name: "Twitter", url: "https://x.com/wendotbrian" },
  { name: "Email", url: "mailto:koringo.w.brian@gmail.com" }
];

export const experienceData = [
  {
    role: "Software Developer",
    company: "Freelance & Open Source",
    period: "2023 - Present",
    description: "Building full-stack web applications, contributing to open-source projects, and developing AI-powered tools for data analysis and automation.",
    highlights: ["Built production-ready apps with React, Next.js & Python", "Shipped cross-platform mobile apps with React Native", "Contributed to open-source developer tools"]
  },
  {
    role: "Computer Science Student",
    company: "University Studies",
    period: "2020 - 2024",
    description: "Focused on software engineering, algorithms, and machine learning. Completed multiple team projects and capstone research in collaborative tools.",
    highlights: ["Coursework in algorithms, databases & ML", "Led senior capstone project on collaboration tools", "Dean's list recognition"]
  },
];
