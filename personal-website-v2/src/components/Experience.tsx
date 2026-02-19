'use client'
import { experienceData } from '@/services/FetchData';
import { useReveal } from '@/hooks/useReveal';

export default function Experience() {
  const sectionRef = useReveal();

  return (
    <section id="experience" ref={sectionRef as React.RefObject<HTMLElement>} className="reveal">
      <div className="section-label">Experience</div>
      <h2 className="section-title">My <span className="accent">Journey</span></h2>
      <p className="section-subtitle">The path that shaped me as a developer</p>
      <div className="timeline">
        {experienceData.map((exp, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h3>{exp.role}</h3>
                <span className="timeline-period">{exp.period}</span>
              </div>
              <p className="timeline-company">{exp.company}</p>
              <p className="timeline-description">{exp.description}</p>
              <ul className="timeline-highlights">
                {exp.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
