const RADIUS   = 54
const CIRCUM   = 2 * Math.PI * RADIUS
const DURATION = 45

export default function RestTimer({ timeLeft, totalSeconds = DURATION, onSkip }) {
  const progress  = timeLeft / totalSeconds
  const dashOffset = CIRCUM * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-slate-400 text-sm font-medium">Descansá</p>

      {/* Círculo SVG */}
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          {/* Track */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none" stroke="#1e293b" strokeWidth="8"
          />
          {/* Progreso */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke="#4ade80"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUM}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        {/* Número en el centro */}
        <span className="absolute inset-0 flex items-center justify-center
                         text-4xl font-bold text-slate-100 tabular-nums">
          {timeLeft}
        </span>
      </div>

      <button
        onClick={onSkip}
        className="rounded-xl border border-slate-600 px-6 py-3 text-sm
                   font-medium text-slate-400 active:bg-slate-800 transition-colors"
      >
        Saltar descanso
      </button>
    </div>
  )
}
