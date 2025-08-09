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
            With a background in Computer Science and years of hands-on experience, I specialize in creating 
            web applications that not only look stunning but also deliver exceptional performance and user experience.
          </p>
          <p>
            My approach combines technical excellence with creative problem-solving. I believe that great software 
            is built on clean architecture, thoughtful design, and a deep understanding of user needs.
          </p>
          <p>
            When I&#39;m not coding, you&#39;ll find me exploring the latest in tech, contributing to open-source projects, 
            or sharing knowledge with the developer community.
          </p>
        </div>
        <div className="about-image">
          <div className="profile-card">
            <div className="profile-avatar">BW</div>
            <h3>Brian Wendot</h3>
            <p style={{ color: "var(--primary-color)", marginBottom: "20px" }}>Full-Stack Developer</p>
            <p style={{ color: "var(--text-secondary)" }}>
              Crafting digital experiences with precision, creativity, and a commitment to excellence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}