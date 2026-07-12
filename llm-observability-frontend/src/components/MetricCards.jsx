export default function MetricCards({ metrics }) {
  if (!metrics) return null

  const errorClass = metrics.error_rate > 0.1 ? 'bad' : metrics.error_rate > 0.02 ? 'warn' : 'good'
  const latencyClass = metrics.latency_p95_ms > 3000 ? 'bad' : metrics.latency_p95_ms > 1200 ? 'warn' : 'good'

  const cards = [
    { label: 'Total Calls (24h)', value: metrics.total_calls, cls: '' },
    { label: 'Total Cost (USD)', value: `$${metrics.total_cost_usd.toFixed(4)}`, cls: '' },
    { label: 'Error Rate', value: `${(metrics.error_rate * 100).toFixed(1)}%`, cls: errorClass },
    { label: 'p95 Latency', value: `${metrics.latency_p95_ms} ms`, cls: latencyClass },
  ]

  return (
    <div className="metric-grid">
      {cards.map((c) => (
        <div className="metric-card" key={c.label}>
          <div className="label">{c.label}</div>
          <div className={`value ${c.cls}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
