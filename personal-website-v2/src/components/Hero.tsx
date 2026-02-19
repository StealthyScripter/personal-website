'use client'
import { useState, useEffect } from 'react';

const codeLines = [
  { segments: [{ text: 'const ', cls: 'code-keyword' }, { text: 'developer', cls: 'code-variable' }, { text: ' = {', cls: 'code-bracket' }] },
  { segments: [{ text: '  name', cls: 'code-property' }, { text: ': ', cls: 'code-punctuation' }, { text: '"Brian Wendot"', cls: 'code-string' }, { text: ',', cls: 'code-punctuation' }] },
  { segments: [{ text: '  role', cls: 'code-property' }, { text: ': ', cls: 'code-punctuation' }, { text: '"Full-Stack Developer"', cls: 'code-string' }, { text: ',', cls: 'code-punctuation' }] },
  { segments: [{ text: '  stack', cls: 'code-property' }, { text: ': ', cls: 'code-punctuation' }, { text: '["React", "Next.js", "Python", "Node.js"]', cls: 'code-string' }, { text: ',', cls: 'code-punctuation' }] },
  { segments: [{ text: '  passion', cls: 'code-property' }, { text: ': ', cls: 'code-punctuation' }, { text: '"Building products that matter"', cls: 'code-string' }] },
  { segments: [{ text: '};', cls: 'code-bracket' }] },
];

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (visibleLines < codeLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setTypingDone(true), 400);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-console">
          <div className="console-header">
            <span className="console-dot red"></span>
            <span className="console-dot yellow"></span>
            <span className="console-dot green"></span>
            <span className="console-title">developer.ts</span>
          </div>
          <div className="console-body">
            {codeLines.map((line, lineIdx) => (
              <div
                key={lineIdx}
                style={{
                  opacity: lineIdx < visibleLines ? 1 : 0,
                  transform: lineIdx < visibleLines ? 'translateX(0)' : 'translateX(-10px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
              >
                {line.segments.map((seg, segIdx) => (
                  <span key={segIdx} className={seg.cls}>{seg.text}</span>
                ))}
                {lineIdx === visibleLines - 1 && !typingDone && (
                  <span className="cursor-blink"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-info" style={{ opacity: typingDone ? 1 : 0, transform: typingDone ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <h1 className="hero-tagline">
            Creating <span className="highlight">exceptional</span> digital experiences
          </h1>
          <p className="hero-description">
            Clean code, innovative solutions, and user-centered design — turning complex problems into elegant products.
          </p>
          <div className="cta-buttons">
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-secondary">Let&apos;s Connect</a>
            <a href="/Brian_Wendot_Resume.pdf" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Resume
            </a>
          </div>
        </div>
      </div>
      <div className="scroll-indicator"></div>
    </section>
  );
}
