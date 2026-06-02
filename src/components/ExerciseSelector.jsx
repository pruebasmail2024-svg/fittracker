import { ALL_EXERCISES } from '../data/workoutPlan'

export default function ExerciseSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Ejercicio
      </label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3
                   text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
      >
        <option value="">Seleccioná un ejercicio…</option>
        {ALL_EXERCISES.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>
    </div>
  )
}
