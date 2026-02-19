import { experienceData } from '@/services/FetchData';

export default function Experience() {
  return (
    <section id="experience">
      <h2 className="section-title">Experience</h2>
      <p className="section-subtitle">My journey in software development</p>
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
