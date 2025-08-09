interface SkillCategoryProps {
  title: string;
  skills: string[];
}

export default function SkillCategory({ title, skills }: SkillCategoryProps) {
  return (
    <div className="skill-category">
      <h3>{title}</h3>
      <div className="skill-tags">
        {skills.map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  );
}
