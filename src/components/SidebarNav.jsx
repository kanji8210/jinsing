const DEFAULT_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "D" },
  { id: "projects", label: "Projects", icon: "P" },
  { id: "finance", label: "Finance", icon: "F" },
  { id: "reports", label: "Reports", icon: "R" },
  { id: "settings", label: "Settings", icon: "S" },
];

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
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`sidebar-link ${activeId === item.id ? "active" : ""}`}
            onClick={() => onSelect?.(item.id)}
          >
            <span className="sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" aria-hidden="true" />
        <p>Online sync enabled</p>
      </div>
    </aside>
  );
}
