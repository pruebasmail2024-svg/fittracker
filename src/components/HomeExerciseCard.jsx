import { useState } from 'react'

function GifOrPlaceholder({ exercise }) {
  if (exercise.gif) {
    return (
      <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
        <img
          src={exercise.gif}
          alt={exercise.name}
          className="w-full object-cover"
          style={{ maxHeight: '160px' }}
        />
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 h-20
                    flex flex-col items-center justify-center gap-1">
      <span className="text-3xl">{exercise.placeholder}</span>
      <span className="text-xs text-slate-500">{exercise.muscles}</span>
    </div>
  )
}

export default function HomeExerciseCard({ block, exercise, prevEntry, onAddSet, onUpdateSet, onRemove }) {
  const isBodyweight = exercise.type === 'reps'
  const [reps, setReps] = useState('')
  const [kg,   setKg]   = useState(exercise.defaultWeight != null ? String(exercise.defaultWeight) : '')

  function handleAddSet() {
    if (!reps) return
    onAddSet(block.instanceId, reps, isBodyweight ? null : kg)
    setReps('')
  }

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex-1 pr-3">
          <p className="font-bold text-slate-100">{exercise.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{exercise.cues}</p>
          <p className="text-xs text-amber-500 mt-1">⚠️ {exercise.commonError}</p>
        </div>
        <button
          onClick={() => onRemove(block.instanceId)}
          className="text-slate-600 text-2xl leading-none active:text-slate-400 shrink-0"
        >
          ×
        </button>
      </div>

      {/* GIF o placeholder */}
      <div className="px-4 pb-3">
        <GifOrPlaceholder exercise={exercise} />
      </div>

      {/* Referencia sesión anterior */}
      {prevEntry && prevEntry.sets.length > 0 && (
        <div className="mx-4 mb-3 rounded-xl bg-slate-700/40 border border-slate-600/40 px-3 py-2.5">
          <p className="text-xs text-slate-500 mb-1.5">Última vez:</p>
          <div className="flex gap-2 flex-wrap">
            {prevEntry.sets.map((s, i) => (
              <span key={i} className="text-xs text-slate-300 bg-slate-700 px-2.5 py-1 rounded-full tabular-nums">
                {isBodyweight ? `${s.reps} reps` : `${s.weightKg} kg × ${s.reps}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Series registradas */}
      {block.sets.length > 0 && (
        <div className="px-4 mb-3 flex flex-col gap-1.5">
          {block.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-brand-500/10 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-500 w-14 shrink-0">Serie {i + 1}</span>
              {!isBodyweight && (
                <>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weightKg}
                    onChange={e => onUpdateSet(block.instanceId, i, 'weightKg', e.target.value)}
                    className="w-14 bg-transparent text-sm text-slate-200 text-center
                               focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-slate-500">kg ×</span>
                </>
              )}
              <input
                type="number"
                inputMode="numeric"
                value={s.reps}
                onChange={e => onUpdateSet(block.instanceId, i, 'reps', e.target.value)}
                className="w-12 bg-transparent text-sm text-slate-200 text-center
                           focus:outline-none tabular-nums"
              />
              <span className="text-xs text-slate-500">reps</span>
            </div>
          ))}
        </div>
      )}

      {/* Agregar serie */}
      <div className="px-4 pb-4 flex gap-2 items-end">
        {!isBodyweight && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">kg</label>
            <input
              type="number"
              inputMode="decimal"
              value={kg}
              onChange={e => setKg(e.target.value)}
              className="w-16 rounded-xl bg-slate-700 border border-slate-600 px-2 py-2.5
                         text-slate-100 text-center focus:outline-none focus:border-brand-500
                         tabular-nums text-sm"
            />
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-slate-500">reps</label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl bg-slate-700 border border-slate-600 px-3 py-2.5
                       text-slate-100 text-center focus:outline-none focus:border-brand-500
                       tabular-nums text-sm"
          />
        </div>
        <button
          onClick={handleAddSet}
          disabled={!reps}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white
                     active:bg-brand-600 disabled:opacity-40 transition-colors shrink-0"
        >
          + Serie
        </button>
      </div>
    </div>
  )
}
