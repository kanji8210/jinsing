const DEFAULT_KPIS = [
  { label: "Active Sites", value: "12", note: "+3 this month" },
  { label: "Budget Utilization", value: "68.4%", note: "Within target" },
  { label: "Open RFIs", value: "27", note: "-5 this week" },
  { label: "Cash Burn (30d)", value: "$1.42M", note: "Forecast stable" },
];

export default function KpiCards({
  items = DEFAULT_KPIS,
  ariaLabel = "Key performance indicators",
}) {
  return (
    <section className="kpi-grid" aria-label={ariaLabel}>
      {items.map((item) => (
        <article key={item.label} className="kpi-card">
          <p className="kpi-label">{item.label}</p>
          <p className="kpi-value">{item.value}</p>
          <p className="kpi-note">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
