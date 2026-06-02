import { useState } from 'react'

export default function SetLogger({ exercise, setIndex, prevExerciseData, onLog }) {
  const prevSet    = prevExerciseData?.sets?.[setIndex] ?? null
  const [kg, setKg]   = useState(prevSet ? String(prevSet.weightKg) : '')
  const [reps, setReps] = useState(prevSet ? String(prevSet.reps) : '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!kg || !reps) return
    onLog(kg, reps)
    // No limpiamos los campos — sirven de referencia para la siguiente serie
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Objetivo de la serie */}
      <p className="text-center text-sm font-medium text-slate-400">
        Objetivo: <span className="text-slate-200">{exercise.repsLabel}</span>
      </p>

      {/* Referencia sesión anterior */}
      {prevSet && (
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/40
                        px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Sesión anterior — serie {setIndex + 1}</span>
          <span className="text-sm font-semibold text-slate-300 tabular-nums">
            {prevSet.weightKg} kg × {prevSet.reps} reps
          </span>
        </div>
      )}

      {/* Campos de entrada */}
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Peso"
          unit="kg"
          value={kg}
          onChange={setKg}
          placeholder={prevSet?.weightKg ?? '0'}
          step="0.5"
        />
        <NumberField
          label="Reps"
          unit="reps"
          value={reps}
          onChange={setReps}
          placeholder={prevSet?.reps ?? '0'}
        />
      </div>

      {/* Botón de confirmar serie */}
      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                   active:bg-brand-600 transition-colors disabled:opacity-40"
        disabled={!kg || !reps}
      >
        ✓ Completé la serie
      </button>
    </form>
  )
}

function NumberField({ label, unit, value, onChange, placeholder, step = '1' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700
                      px-3 py-3 focus-within:border-brand-500 transition-colors">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={String(placeholder)}
          step={step}
          min="0"
          className="flex-1 bg-transparent text-slate-100 text-xl font-bold
                     placeholder-slate-600 focus:outline-none w-0"
        />
        <span className="text-slate-500 text-sm shrink-0">{unit}</span>
      </div>
    </div>
  )
}
