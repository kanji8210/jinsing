import { useEffect, useRef } from 'react';
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Register necessary chart components
// (registration done above)

/**
 * PortfolioChart renders a simple bar chart showing total vs spent budgets.
 * It receives the portfolio summary object with `budgetTotal` and `budgetSpent`.
 */
export default function PortfolioChart({ portfolioSummary }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--gold').trim() || '#d6aa43';
    const orange = styles.getPropertyValue('--orange').trim() || '#ef7b2d';
    const ink = styles.getPropertyValue('--ink').trim() || '#edf3fb';
    const muted = styles.getPropertyValue('--muted').trim() || '#8aa0b9';

    const totalGradient = ctx.createLinearGradient(0, 0, 0, 220);
    totalGradient.addColorStop(0, gold);
    totalGradient.addColorStop(1, 'rgba(214, 170, 67, 0.2)');

    const spentGradient = ctx.createLinearGradient(0, 0, 0, 220);
    spentGradient.addColorStop(0, orange);
    spentGradient.addColorStop(1, 'rgba(239, 123, 45, 0.2)');

    // If chart already exists, just update data
    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = [
        portfolioSummary?.budgetTotal || 0,
        portfolioSummary?.budgetSpent || 0,
      ];
      chartRef.current.data.datasets[0].backgroundColor = [totalGradient, spentGradient];
      chartRef.current.update();
      return;
    }
    // Create new chart instance
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Budget', 'Spent'],
        datasets: [
          {
            label: 'Budget (USD)',
            data: [portfolioSummary?.budgetTotal || 0, portfolioSummary?.budgetSpent || 0],
            backgroundColor: [totalGradient, spentGradient],
            borderRadius: 12,
            borderSkipped: false,
            maxBarThickness: 72,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(8, 17, 29, 0.94)',
            titleColor: ink,
            bodyColor: ink,
            borderColor: 'rgba(214, 170, 67, 0.25)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y ?? 0;
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: ink, font: { size: 12, weight: '600' } },
          },
          y: {
            grid: { color: 'rgba(138, 160, 185, 0.12)' },
            border: { display: false },
            ticks: { color: muted, beginAtZero: true, padding: 10 },
          },
        },
      },
    });
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [portfolioSummary]);

  return (
    <div className="portfolio-chart" style={{ height: '180px', marginTop: '1rem' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
