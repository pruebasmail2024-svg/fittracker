import { useState } from 'react'
import { useExerciseHistory } from '../hooks/useExerciseHistory'
import ExerciseHistoryChart from './ExerciseHistoryChart'

export default function ExerciseInlineChart({ exerciseId }) {
  const { data, loading } = useExerciseHistory(exerciseId)
  const [open, setOpen]   = useState(false)

  // Mostramos solo las últimas 8 sesiones para que el gráfico sea legible
  const displayData = data.slice(-8)

  if (loading || data.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-sm text-slate-400 font-medium">
          📊 Mi historial en este ejercicio
        </span>
        <span className="text-slate-500 text-xs font-mono">
          {open ? '▲ ocultar' : '▼ ver'}
        </span>
      </button>

      {open && (
        <div className="px-2 pb-4">
          <div className="flex gap-4 px-2 mb-2">
            <span className="text-xs text-brand-400">— Peso máx (kg)</span>
            <span className="text-xs text-sky-400">— Reps totales</span>
          </div>
          <ExerciseHistoryChart data={displayData} height={150} />
        </div>
      )}
    </div>
  )
}
