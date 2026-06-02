export default function ExerciseCard({ exercise, setIndex, totalSets }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Encabezado: nombre + progreso de series */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {exercise.pairLabel}
          </p>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">{exercise.name}</h2>
        </div>
        <span className="text-sm font-semibold text-brand-400 bg-brand-500/10
                         px-3 py-1 rounded-full border border-brand-500/20 shrink-0 ml-2">
          Serie {setIndex + 1} / {totalSets}
        </span>
      </div>

      {/* GIF */}
      <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
        <img
          src={exercise.gif}
          alt={exercise.name}
          className="w-full object-cover"
          style={{ maxHeight: '200px' }}
        />
      </div>

      {/* Descripción técnica */}
      <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-3
                      flex flex-col gap-2">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide">
          {exercise.muscles}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{exercise.cues}</p>
        <p className="text-xs text-amber-400">
          ⚠️ {exercise.commonError}
        </p>
      </div>
    </div>
  )
}
