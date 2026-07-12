import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function TrendChart({ timeseries }) {
  const hasData = timeseries && timeseries.length > 0

  return (
    <div className="panel">
      <h2>Latency &amp; Cost Trend</h2>
      {!hasData ? (
        <div className="empty-state">No requests logged yet in this window. Send one from the console below.</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeseries}>
            <CartesianGrid stroke="#232b36" strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fill: '#8b98a5', fontSize: 10 }} hide={timeseries.length > 8} />
            <YAxis yAxisId="left" tick={{ fill: '#8b98a5', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b98a5', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#151b23', border: '1px solid #232b36', fontSize: 12 }}
              labelStyle={{ color: '#8b98a5' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="avg_latency_ms" stroke="#5eb1f0" strokeWidth={2} dot={false} name="Avg Latency (ms)" />
            <Line yAxisId="right" type="monotone" dataKey="cost_usd" stroke="#f0b35e" strokeWidth={2} dot={false} name="Cost (USD)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
