import { ROTATION_VARIANTS } from '../services/analyticsService'
import { ALL_EXERCISES } from '../data/workoutPlan'

export default function RotationAlert({ daysSinceStart }) {
  const cycle = Math.floor(daysSinceStart / 120)
  if (cycle < 1) return null

  const suggestions = ALL_EXERCISES
    .filter(ex => ROTATION_VARIANTS[ex.id])
    .map(ex => ({ name: ex.name, suggestion: ROTATION_VARIANTS[ex.id] }))

  return (
    <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-4">
      <div className="flex gap-2 items-start mb-3">
        <span className="text-xl shrink-0">🔄</span>
        <div>
          <p className="text-sm font-semibold text-violet-300">
            Rotación de variantes — Ciclo {cycle}
          </p>
          <p className="text-xs text-violet-400/70 mt-0.5">
            Llevás {Math.round(daysSinceStart)} días entrenando. Es buen momento para
            variar los ejercicios manteniendo los mismos patrones de movimiento.
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2 mt-1">
        {suggestions.map(({ name, suggestion }) => (
          <li key={name} className="flex gap-2 text-xs items-baseline">
            <span className="text-slate-400 shrink-0">{name}</span>
            <span className="text-slate-600">→</span>
            <span className="text-violet-300">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
