export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-subtitle">Software &amp; Web Developer</div>
        <h1 className="hero-title">Brian Wendot</h1>
        <p className="hero-description">
          Creating exceptional digital experiences through clean code, innovative solutions, and user-centered design
        </p>
        <div className="cta-buttons">
          <a href="#projects" className="btn btn-primary">View My Work</a>
          <a href="#contact" className="btn btn-secondary">Let&#39;s Connect</a>
          <a href="/Brian_Wendot_Resume.pdf" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Resume
          </a>
        </div>
      </div>
      <div className="scroll-indicator"></div>
    </section>
  );
}
