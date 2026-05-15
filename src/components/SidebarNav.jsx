const DEFAULT_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "projects", label: "Projects", icon: "projects" },
  { id: "finance", label: "Finance", icon: "finance" },
  { id: "reports", label: "Reports", icon: "reports" },
  { id: "docs", label: "Documentation", icon: "docs" },
  { id: "entries", label: "Auto Entries", icon: "entries" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function NavIcon({ name }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h7v7H4v-7zm9 6v-9h7v9h-7z" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2-5h8v2H8V3z" />
        </svg>
      );
    case "finance":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19h14v2H5v-2zm2-3h2V9H7v7zm4 0h2V5h-2v11zm4 0h2v-5h-2v5z" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 2h9l5 5v15H6V2zm9 1.5V8h4.5L15 3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2zM8 8h4v2H8V8z" />
        </svg>
      );
    case "docs":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v2H4V4zm0 4h12v2H4V8zm0 4h16v2H4v-2zm0 4h12v2H4v-2z" />
        </svg>
      );
    case "entries":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3h18v4H3V3zm0 6h18v2H3V9zm0 5h10v2H3v-2zm14 0l3 3-3 3-1.4-1.4 1.6-1.6-1.6-1.6L17 14zm-4 5v2H3v-2h10z" />
        </svg>
      );
    case "settings":
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.06 7.06 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.5.42l-.36 2.54c-.58.22-1.13.54-1.63.94l-2.39-.96a.5.5 0 0 0-.61.22L2.69 8.48a.5.5 0 0 0 .12.63l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.81 14.15a.5.5 0 0 0-.12.63l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .5.42h3.8a.5.5 0 0 0 .5-.42l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
        </svg>
      );
  }
}

export default function SidebarNav({
  brand = "JEEA",
  subtitle = "Construction admin",
  items = DEFAULT_ITEMS,
  activeId = "dashboard",
  onSelect,
}) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-mark" aria-hidden="true">
          J
        </div>
        <div>
          <p className="sidebar-brand-name">{brand}</p>
          <p className="sidebar-brand-subtitle">{subtitle}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${activeId === item.id ? "active" : ""}`}
            onClick={() => onSelect?.(item.id)}
          >
            <span className="sidebar-icon" aria-hidden="true">
              <NavIcon name={item.icon} />
            </span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" aria-hidden="true" />
        <p>Online sync enabled</p>
      </div>
    </aside>
  );
}
