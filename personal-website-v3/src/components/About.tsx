'use client'
import { useReveal } from '@/hooks/useReveal';

const profileCode = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13',
];

export default function About() {
  const sectionRef = useReveal();

  return (
    <section id="about" ref={sectionRef as React.RefObject<HTMLElement>} className="reveal">
      <div className="section-label">About</div>
      <h2 className="section-title">Who I <span className="accent">Am</span></h2>
      <p className="section-subtitle">
        Passionate about turning complex problems into elegant, scalable solutions
      </p>
      <div className="about-content">
        <div className="about-text">
          <h3>Building the Future, One Line at a Time</h3>
          <p>
            I&apos;m a software developer based in Durham, North Carolina, with a Computer Science background
            and a passion for building products that make a real impact. I specialize in full-stack web
            development using React, Next.js, Python, and Node.js.
          </p>
          <p>
            From an AI-powered trading analytics dashboard to a cross-platform collaboration tool,
            I enjoy tackling projects that push me to learn new technologies and solve meaningful problems.
            I&apos;m particularly drawn to clean architecture and delivering polished user experiences.
          </p>
          <p>
            When I&apos;m not coding, you&apos;ll find me exploring the latest in AI and machine learning,
            contributing to open-source projects, or sharing what I&apos;ve learned with the developer community.
          </p>
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">3+</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">7+</span>
              <span className="stat-label">Technologies</span>
            </div>
          </div>
        </div>
        <div className="about-image">
          <div className="code-editor">
            <div className="editor-tabs">
              <div className="editor-tab active">profile.ts</div>
              <div className="editor-tab">skills.ts</div>
            </div>
            <div className="editor-body">
              <div className="line-numbers">
                {profileCode.map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              <div className="editor-code">
                <div><span className="code-keyword">interface </span><span className="code-type">Developer</span> <span className="code-bracket">{'{'}</span></div>
                <div>  <span className="code-property">name</span><span className="code-punctuation">: </span><span className="code-type">string</span><span className="code-punctuation">;</span></div>
                <div>  <span className="code-property">location</span><span className="code-punctuation">: </span><span className="code-type">string</span><span className="code-punctuation">;</span></div>
                <div>  <span className="code-property">focus</span><span className="code-punctuation">: </span><span className="code-type">string[]</span><span className="code-punctuation">;</span></div>
                <div><span className="code-bracket">{'}'}</span></div>
                <div>&nbsp;</div>
                <div><span className="code-keyword">const </span><span className="code-variable">brian</span><span className="code-punctuation">: </span><span className="code-type">Developer</span> <span className="code-punctuation">= </span><span className="code-bracket">{'{'}</span></div>
                <div>  <span className="code-property">name</span><span className="code-punctuation">: </span><span className="code-string">&quot;Brian Wendot&quot;</span><span className="code-punctuation">,</span></div>
                <div>  <span className="code-property">location</span><span className="code-punctuation">: </span><span className="code-string">&quot;Durham, NC&quot;</span><span className="code-punctuation">,</span></div>
                <div>  <span className="code-property">focus</span><span className="code-punctuation">: </span><span className="code-string">[&quot;React&quot;, &quot;Next.js&quot;, &quot;Python&quot;]</span><span className="code-punctuation">,</span></div>
                <div><span className="code-bracket">{'}'}</span><span className="code-punctuation">;</span></div>
                <div>&nbsp;</div>
                <div><span className="code-keyword">export default </span><span className="code-variable">brian</span><span className="code-punctuation">;</span></div>
              </div>
            </div>
          </div>
          <div className="profile-links" style={{ marginTop: '20px' }}>
            <a href="https://github.com/StealthyScripter" target="_blank" rel="noopener noreferrer" className="profile-social-link">GitHub</a>
            <a href="https://linkedin.com/in/brian-koringo" target="_blank" rel="noopener noreferrer" className="profile-social-link">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}
