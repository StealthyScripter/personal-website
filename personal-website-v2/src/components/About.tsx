export default function About() {
  return (
    <section id="about">
      <h2 className="section-title">About Me</h2>
      <p className="section-subtitle">
        Passionate about turning complex problems into elegant, scalable solutions
      </p>
      <div className="about-content">
        <div className="about-text">
          <h3>Building the Future, One Line at a Time</h3>
          <p>
            I&#39;m a software developer based in Durham, North Carolina, with a Computer Science background 
            and a passion for building products that make a real impact. I specialize in full-stack web 
            development using React, Next.js, Python, and Node.js.
          </p>
          <p>
            From an AI-powered trading analytics dashboard to a cross-platform collaboration tool, 
            I enjoy tackling projects that push me to learn new technologies and solve meaningful problems. 
            I&#39;m particularly drawn to clean architecture and delivering polished user experiences.
          </p>
          <p>
            When I&#39;m not coding, you&#39;ll find me exploring the latest in AI and machine learning, 
            contributing to open-source projects, or sharing what I&#39;ve learned with the developer community.
          </p>
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">3+</span>
              <span className="stat-label">Years Coding</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10+</span>
              <span className="stat-label">Projects Built</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">7+</span>
              <span className="stat-label">Technologies</span>
            </div>
          </div>
        </div>
        <div className="about-image">
          <div className="profile-card">
            <div className="profile-avatar">BW</div>
            <h3>Brian Wendot</h3>
            <p style={{ color: "var(--primary-color)", marginBottom: "20px" }}>Full-Stack Developer</p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              Crafting digital experiences with precision, creativity, and a commitment to excellence.
            </p>
            <div className="profile-links">
              <a href="https://github.com/StealthyScripter" target="_blank" rel="noopener noreferrer" className="profile-social-link">GitHub</a>
              <a href="https://linkedin.com/in/brian-koringo" target="_blank" rel="noopener noreferrer" className="profile-social-link">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
