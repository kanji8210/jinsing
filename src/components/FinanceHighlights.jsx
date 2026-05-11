const HIGHLIGHTS = [
  { title: "Committed Cost", value: "$8.9M" },
  { title: "Forecast at Completion", value: "$11.2M" },
  { title: "Variance", value: "-2.1%" },
];

export default function FinanceHighlights({
  title = "Finance Highlights",
  chip = "Cost Control",
  items = HIGHLIGHTS,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span className="chip">{chip}</span>
      </div>
      <div className="finance-list">
        {items.map((item) => (
          <article key={item.title} className="finance-item">
            <p>{item.title}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
