import { WORKOUT_PLAN } from '../data/workoutPlan'
import { ALL_EXERCISES } from '../data/workoutPlan'

export default function SessionSummary({ dayIndex, loggedData, onFinish }) {
  const day = WORKOUT_PLAN[dayIndex]
  const totalSets = Object.values(loggedData).reduce((acc, sets) => acc + sets.length, 0)

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Encabezado */}
      <div className="text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold text-slate-100 mt-3">¡Sesión completada!</h2>
        <p className="text-slate-400 text-sm mt-1">{day.label} — {day.focus}</p>
      </div>

      {/* Resumen de series */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
        {Object.entries(loggedData).map(([exerciseId, sets], i) => {
          const ex = ALL_EXERCISES.find(e => e.id === exerciseId)
          return (
            <div
              key={exerciseId}
              className={`px-4 py-3 ${i > 0 ? 'border-t border-slate-700/50' : ''}`}
            >
              <p className="text-sm font-semibold text-slate-200">{ex?.name ?? exerciseId}</p>
              <div className="flex gap-3 mt-1.5 flex-wrap">
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

      <p className="text-center text-xs text-slate-500">
        {totalSets} series · Guardado en historial
      </p>

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
