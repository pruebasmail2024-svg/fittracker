import { WORKOUT_PLAN, ALL_EXERCISES } from '../data/workoutPlan'
import { formatDuration, formatVolume } from '../utils/format'

export default function SessionSummary({ dayIndex, loggedData, startedAt, onFinish }) {
  const day       = WORKOUT_PLAN[dayIndex]
  const totalSets = Object.values(loggedData).reduce((acc, sets) => acc + sets.length, 0)

  const totalVolume = Object.values(loggedData).flat().reduce(
    (acc, s) => acc + Number(s.weightKg) * Number(s.reps), 0
  )

  const durationSeconds = startedAt
    ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
    : 0

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Encabezado */}
      <div className="text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold text-slate-100 mt-3">¡Sesión completada!</h2>
        <p className="text-slate-400 text-sm mt-1">{day.label} — {day.focus}</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Series</p>
          <p className="text-lg font-bold text-slate-100 tabular-nums">{totalSets}</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Volumen</p>
          <p className="text-lg font-bold text-brand-400 tabular-nums">
            {formatVolume(totalVolume)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Duración</p>
          <p className="text-lg font-bold text-slate-100 tabular-nums">
            {formatDuration(durationSeconds)}
          </p>
        </div>
      </div>

      {/* Desglose por ejercicio */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
        {Object.entries(loggedData).map(([exerciseId, sets], i) => {
          const ex     = ALL_EXERCISES.find(e => e.id === exerciseId)
          const exVol  = sets.reduce((acc, s) => acc + Number(s.weightKg) * Number(s.reps), 0)
          return (
            <div
              key={exerciseId}
              className={`px-4 py-3 ${i > 0 ? 'border-t border-slate-700/50' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-slate-200">{ex?.name ?? exerciseId}</p>
                <span className="text-xs text-slate-500 tabular-nums">
                  {formatVolume(exVol)}
                </span>
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {sets.map((s, j) => (
                  <span key={j} className="text-xs text-slate-400 bg-slate-700/50
                                           px-2.5 py-1 rounded-full tabular-nums">
                    {s.weightKg} kg × {s.reps}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onFinish}
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                   active:bg-brand-600 transition-colors"
      >
        Finalizar
      </button>
    </div>
  )
}
