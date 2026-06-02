import { formatDateLong } from '../utils/date'

export default function ExerciseHistoryTable({ data }) {
  if (data.length === 0) return null

  const sorted = [...data].reverse()

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-400">Historial completo</h3>
      <div className="rounded-xl overflow-hidden border border-slate-700/50">
        {sorted.map((entry, i) => (
          <div
            key={i}
            className={`px-4 py-3 bg-slate-800/40 ${i > 0 ? 'border-t border-slate-700/30' : ''}`}
          >
            <p className="text-xs text-slate-500 mb-2">{formatDateLong(entry.rawDate)}</p>
            <div className="flex gap-2 flex-wrap">
              {entry.sets.map((s, j) => (
                <span
                  key={j}
                  className="text-xs bg-slate-700/60 text-slate-300
                             px-2.5 py-1 rounded-full tabular-nums"
                >
                  {s.weightKg} kg × {s.reps}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
