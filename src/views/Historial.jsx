import { useWeightLogs } from '../hooks/useWeightLogs'
import { formatDateLong } from '../utils/date'

export default function Historial() {
  const { logs, loading } = useWeightLogs()

  // Los más recientes primero
  const sorted = [...logs].reverse()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-100">Historial de peso</h1>

      {loading && (
        <p className="text-slate-500 text-sm">Cargando registros…</p>
      )}

      {!loading && sorted.length === 0 && (
        <p className="text-slate-500 text-sm">
          Todavía no hay registros. El primero se guardó al completar el perfil.
        </p>
      )}

      {!loading && sorted.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sorted.map((log, i) => (
            <WeightCard key={log.id} log={log} isLatest={i === 0} />
          ))}
        </ul>
      )}
    </div>
  )
}

function WeightCard({ log, isLatest }) {
  return (
    <li className={`flex items-center justify-between rounded-xl px-4 py-3 border
      ${isLatest
        ? 'bg-brand-500/10 border-brand-500/30'
        : 'bg-slate-800/60 border-slate-700/50'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-slate-400">
          {formatDateLong(log.recordedAt)}
        </span>
        {isLatest && (
          <span className="text-xs font-medium text-brand-400">Más reciente</span>
        )}
      </div>
      <span className={`text-2xl font-bold tabular-nums
        ${isLatest ? 'text-brand-400' : 'text-slate-200'}`}
      >
        {log.weightKg} <span className="text-sm font-normal text-slate-500">kg</span>
      </span>
    </li>
  )
}
