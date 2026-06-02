import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 },
  labelStyle:   { color: '#94a3b8', fontSize: 11 },
  itemStyle:    { fontSize: 12 },
}

export default function ExerciseHistoryChart({ data, height = 200 }) {
  const [mode, setMode] = useState('performance') // 'performance' | 'volume'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
        Todavía no hay sesiones con este ejercicio.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle de modo */}
      <div className="flex rounded-xl bg-slate-900 p-0.5 gap-0.5 self-start">
        {[['performance', 'Peso / Reps'], ['volume', 'Volumen']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === key ? 'bg-slate-700 text-slate-100' : 'text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval="preserveStartEnd"
          />

          {mode === 'performance' && (
            <>
              <YAxis yAxisId="kg"   domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis yAxisId="reps" orientation="right" domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line yAxisId="kg"   type="monotone" dataKey="maxWeight" stroke="#4ade80"
                    strokeWidth={2} dot={{ fill: '#4ade80', r: 4 }} activeDot={{ r: 6 }}
                    name="Peso máx (kg)" />
              <Line yAxisId="reps" type="monotone" dataKey="totalReps" stroke="#38bdf8"
                    strokeWidth={2} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }}
                    name="Reps totales" />
            </>
          )}

          {mode === 'volume' && (
            <>
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="volume" stroke="#a78bfa"
                    strokeWidth={2} dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }}
                    name="Volumen (kg×reps)" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
