export default function BrandHeader({
  eyebrow = "Construction Intelligence",
  title = "JEEA",
  description = "Engineering progress, financial clarity, and field execution in one command surface.",
}) {
  return (
    <header className="hero">
      <div className="logo-wrap" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img" className="logo-icon">
          <rect x="8" y="14" width="48" height="42" rx="6" className="logo-shell" />
          <rect x="16" y="22" width="8" height="8" className="logo-window" />
          <rect x="28" y="22" width="8" height="8" className="logo-window" />
          <rect x="40" y="22" width="8" height="8" className="logo-window" />
          <rect x="16" y="34" width="8" height="8" className="logo-window" />
          <rect x="28" y="34" width="8" height="8" className="logo-window" />
          <rect x="40" y="34" width="8" height="8" className="logo-window" />
          <rect x="28" y="44" width="8" height="12" className="logo-door" />
        </svg>
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
      </div>
    </header>
  );
}
