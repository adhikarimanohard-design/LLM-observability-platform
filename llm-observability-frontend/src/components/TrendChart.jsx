import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function TrendChart({ timeseries, loading }) {
  const hasData = timeseries && timeseries.length > 0

  return (
    <motion.div
      className="panel graph-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h2>
        <span className="icon-label">
          <TrendingUp size={15} color="#8b5cf6" />
          Latency &amp; Cost Trend
        </span>
      </h2>
      <div className="chart-container">
        {loading ? (
          <div className="skeleton" style={{ height: 240, width: '100%' }} />
        ) : !hasData ? (
          <div
            className="empty-state"
            style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            No requests logged yet in this window. Send one from the console below.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeseries} margin={{ top: 5, right: 12, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tick={{ fill: '#565f75', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                hide={timeseries.length > 12}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" width={38} tick={{ fill: '#565f75', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" width={46} tick={{ fill: '#565f75', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0d0f16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: 'IBM Plex Mono',
                }}
                labelStyle={{ color: '#8b93a7' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avg_latency_ms"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#latencyGradient)"
                name="Avg Latency (ms)"
                dot={{ r: 3, strokeWidth: 0, fill: '#8b5cf6' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost_usd"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#costGradient)"
                name="Cost (USD)"
                dot={{ r: 3, strokeWidth: 0, fill: '#22d3ee' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}