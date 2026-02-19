import { socialLinks } from "@/services/FetchData";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="social-links">
        {socialLinks.map(({ name, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            {name}
          </a>
        ))}
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}>
        &copy; {currentYear} Brian Wendot &mdash; Crafted with precision
      </p>
    </footer>
  );
}
