const PIPELINE = [
  { phase: "Planning", count: 4, emphasis: "calm" },
  { phase: "Procurement", count: 3, emphasis: "hot" },
  { phase: "Execution", count: 5, emphasis: "strong" },
  { phase: "Closeout", count: 2, emphasis: "calm" },
];

export default function ProjectPipeline({
  title = "Project Pipeline",
  chip = "Engineering Flow",
  items = PIPELINE,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span className="chip">{chip}</span>
      </div>
      <ul className="pipeline-list">
        {items.map((item) => (
          <li key={item.phase} className={`pipeline-item ${item.emphasis}`}>
            <span>{item.phase}</span>
            <strong>{item.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
