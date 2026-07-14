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
          <TrendingUp size={18} color="#00f0ff" />
          Latency &amp; Cost Trend
        </span>
      </h2>
      
      <div className="chart-container">
        {loading ? (
          <div className="skeleton" style={{ height: '100%', width: '100%' }} />
        ) : !hasData ? (
          <div className="empty-state">No requests logged yet in this window. Send one from the console below.</div>
        ) : (
          {/* Height increased to 350 to make it prominent without adding blank space below */}
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeseries} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8a2be2" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8a2be2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tick={{ fill: '#ffffff', fontSize: 12, fontFamily: 'Fira Code', textShadow: '0 0 5px rgba(255,255,255,0.5)' }}
                hide={timeseries.length > 8}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                yAxisId="left" 
                width={50} 
                tick={{ fill: '#ffffff', fontSize: 12, fontFamily: 'Fira Code', textShadow: '0 0 8px rgba(255,255,255,0.6)' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                width={55} 
                tick={{ fill: '#ffffff', fontSize: 12, fontFamily: 'Fira Code', textShadow: '0 0 8px rgba(255,255,255,0.6)' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 12, 25, 0.95)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontFamily: 'Fira Code',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avg_latency_ms"
                stroke="#8a2be2"
                strokeWidth={3}
                fill="url(#latencyGradient)"
                name="Avg Latency (ms)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost_usd"
                stroke="#00f0ff"
                strokeWidth={3}
                fill="url(#costGradient)"
                name="Cost (USD)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}
