import { HOME_EXERCISE_CATEGORIES } from '../data/homeExercises'

export default function HomeExercisePicker({ isOpen, onSelect, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[80vh]
                      flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Elegí un ejercicio</h3>
          <button
            onClick={onClose}
            className="text-slate-500 text-2xl leading-none active:text-slate-300"
          >
            ×
          </button>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-5">
          {HOME_EXERCISE_CATEGORIES.map(cat => (
            <div key={cat.category}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {cat.category}
              </p>
              <div className="flex flex-col gap-2">
                {cat.exercises.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => { onSelect(ex.id); onClose() }}
                    className="w-full text-left rounded-xl bg-slate-800 border border-slate-700
                               px-4 py-3 active:bg-slate-700 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-200">{ex.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ex.muscles}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
