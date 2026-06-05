import { formatDateLong } from '../utils/date'
import { resolverEjercicio } from '../services/rutinaService'
import { getRutina } from '../services/rutinaService'

function sessionLabel(session) {
  const type = session.sessionType ?? 'gym'
  if (type === 'home_extra')        return 'Casa — complemento'
  if (type === 'home_replacement') {
    const rutina = getRutina()
    const day    = rutina[session.dayIndex]
    return `Casa — reemplazó ${day?.label ?? ''}`
  }
  const rutina = getRutina()
  const day    = rutina[session.dayIndex]
  return day?.label ?? 'Gym'
}

export default function ModalConfirmarBorrado({ session, onConfirm, onClose }) {
  if (!session) return null

  const fecha = formatDateLong(session.startedAt || session.completedAt)
  const label = sessionLabel(session)
  const totalSets = (session.exercises ?? []).reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl px-5 py-6
                      flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

        {/* Ícono + título */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">🗑️</span>
          <h3 className="text-lg font-bold text-slate-100">¿Borrar esta sesión?</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-medium">{fecha} — {label}</span>
            <br />Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Resumen de la sesión */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3
                        flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Contenido de la sesión
          </p>
          <p className="text-xs text-slate-400">{totalSets} series en total</p>
          {(session.exercises ?? []).map(ex => {
            const ej = resolverEjercicio(ex.exerciseId)
            const nombre = ej?.nombre ?? ex.exerciseId
            return (
              <div key={ex.exerciseId} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{nombre}</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {ex.sets.length} {ex.sets.length === 1 ? 'serie' : 'series'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-2xl bg-red-500 py-4 text-base font-bold text-white
                       active:bg-red-600 transition-colors"
          >
            Sí, borrar
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-600 py-4 text-base
                       font-medium text-slate-400 active:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
