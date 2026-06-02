import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

export default function BodyWeightChart({ chartData }) {
  const hasReal = chartData.some(d => d.real != null)

  return (
    <div>
      {!hasReal && (
        <p className="text-xs text-slate-500 text-center mb-3">
          Registrá tu peso quincenal para ver tu progreso real frente a la proyección.
        </p>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#475569"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            name="Proyección ideal (kg)"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="real"
            stroke="#4ade80"
            strokeWidth={2.5}
            dot={{ fill: '#4ade80', r: 4 }}
            activeDot={{ r: 6 }}
            name="Peso real (kg)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
