import { socialLinks } from "@/services/FetchData";

export default function Footer() {
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
      <p style={{ color: "var(--text-secondary)" }}>
        © 2025 Brian Wendot. Crafted with passion and precision.
      </p>
    </footer>
  );
}
