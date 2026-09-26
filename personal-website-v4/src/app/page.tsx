import Link from '@/components/ui/SiteLink';
import { site } from '@/content/site';
import { getNotes, getProjects, getCurrently, getSettings } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { ProjectCard } from '@/components/project/ProjectCard';
import { NotesList } from '@/components/notes/NotesList';
import { Arrow } from '@/components/ui/Arrow';
import { Landscape } from '@/components/ui/Landscape';
import { ConversationForm } from '@/components/ConversationForm';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Projects, ideas & a little curiosity', site.description, '/');
const unavailable = <p className="content-unavailable" role="status">This content is temporarily unavailable. Please try again shortly.</p>;

export default async function Home() {
  const [projectsResult, notesResult, currentlyResult, settingsResult] = await Promise.allSettled([getProjects(), getNotes(), getCurrently(), getSettings()]);
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
  const featured = projects.filter((project) => project.featured).slice(0, 3);
  const remaining = projects.filter((project) => !featured.includes(project));
  const notes = notesResult.status === 'fulfilled' ? notesResult.value : [];
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
  const currently = currentlyResult.status === 'fulfilled' ? currentlyResult.value : [];
  return <div className="container">
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy">
      <p className="eyebrow"><span className="small-line" />{settings?.hero.eyebrow || 'A personal corner of the internet'}</p>
      <h1 id="hero-title">{settings?.hero.thought || 'Curiosity turns ordinary days into interesting ones.'}</h1>
      {settings ? <p className="hero-introduction">{settings.hero.introduction}</p> : unavailable}
      <div className="hero-actions"><Link href="#projects" className="button button-primary">Explore Projects <Arrow /></Link><Link href="#notes" className="text-link">Explore Notes <Arrow /></Link></div>
    </div><Landscape /></section>
    <section id="projects" className="home-section" aria-labelledby="featured-title" tabIndex={-1}>
      <div className="section-heading"><div><p className="eyebrow">An idea, made tangible</p><h2 id="featured-title">Selected projects</h2><p className="section-introduction">A few ideas I&apos;ve spent enough time with to turn into something real.</p></div></div>
      {projectsResult.status === 'rejected' ? unavailable : projects.length === 0 ? <p className="subtle">No projects published yet.</p> : <><div className="project-grid">{featured.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>{remaining.length > 0 && <details className="more-content"><summary>More projects</summary><div className="project-grid">{remaining.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></details>}</>}
    </section>
    <section id="notes" className="home-section" aria-labelledby="notes-title" tabIndex={-1}>
      <div className="section-heading"><div><p className="eyebrow">Along the way</p><h2 id="notes-title">Notes & things worth sharing.</h2><p className="section-introduction">Things I&apos;ve learned, thoughts worth keeping, and good work I&apos;ve come across elsewhere.</p></div></div>
      {notesResult.status === 'rejected' ? unavailable : <><NotesList notes={notes.slice(0, 3)} />{notes.length > 3 && <details className="more-content"><summary>More notes</summary><NotesList notes={notes.slice(3)} /></details>}</>}
    </section>
    <section id="about" className="home-section about-section" aria-labelledby="about-title" tabIndex={-1}><div><p className="eyebrow">A little about me</p><h2 id="about-title">Curiosity is a good place to start.</h2></div><div className="prose">{settings ? settings.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : unavailable}</div></section>
    <section className="currently" aria-labelledby="currently-title"><h2 id="currently-title"><span className="currently-dot" aria-hidden="true" />Currently</h2>{currentlyResult.status === 'rejected' ? unavailable : currently.length ? <dl>{currently.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.href ? <Link href={item.href}>{item.text} <Arrow external={item.href.startsWith('http')} /></Link> : item.text}</dd></div>)}</dl> : <p className="subtle">A quiet moment. More to share soon.</p>}</section>
    <section id="contact" className="home-section conversation-section" aria-labelledby="contact-title" tabIndex={-1}><div className="conversation-intro"><p className="eyebrow">Start a conversation</p><h2 id="contact-title">Have something interesting to talk about?</h2><p className="section-introduction">A project, an idea, something you&apos;re building—or simply something you think I&apos;d find interesting. Send me a note.</p></div><div><ConversationForm />{settings && <div className="conversation-links"><a href={`mailto:${settings.email}`} aria-label="Open your email client" title="Open your email client">✉</a>{settings.social.map((social) => <a key={social.label} href={social.url}>{social.label}<Arrow external /></a>)}</div>}</div></section>
  </div>;
}
