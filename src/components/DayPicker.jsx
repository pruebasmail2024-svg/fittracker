import { WORKOUT_PLAN } from '../data/workoutPlan'

export default function DayPicker({ onSelectDay }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Entrenar</h1>
        <p className="text-sm text-slate-400 mt-1">¿Qué día hacemos hoy?</p>
      </div>

      <ul className="flex flex-col gap-3">
        {WORKOUT_PLAN.map((day) => (
          <li key={day.dayIndex}>
            <button
              onClick={() => onSelectDay(day.dayIndex)}
              className="w-full text-left rounded-2xl bg-slate-800 border border-slate-700
                         px-5 py-4 active:scale-95 transition-transform"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-100 text-lg">{day.label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{day.focus}</p>
                </div>
                <span className="text-2xl">💪</span>
              </div>
              <ul className="mt-3 flex flex-col gap-1">
                {day.pairs.map((pair, i) => (
                  <li key={i} className="text-xs text-slate-500">
                    {pair.exercises.map(e => e.name).join(' + ')}
                  </li>
                ))}
              </ul>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
