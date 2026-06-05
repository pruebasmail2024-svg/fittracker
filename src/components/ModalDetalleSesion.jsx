import { useState } from 'react'
import { formatDateLong }    from '../utils/date'
import { formatDuration, formatVolume } from '../utils/format'
import { resolverEjercicio, getRutina } from '../services/rutinaService'
import ModalEditarSesion from './ModalEditarSesion'
import { updateSession } from '../services/workoutService'

const PAUSA_IDS = new Set(['plancha', 'farmers-walk'])

function sessionLabel(session) {
  const rutina = getRutina()
  const type   = session.sessionType ?? 'gym'
  const day    = session.dayIndex != null ? rutina[session.dayIndex] : null
  if (type === 'home_extra')        return '🏠 Casa — complemento'
  if (type === 'home_replacement')  return `🏠 Casa — reemplazó ${day?.label ?? ''}`
  return `🏋️ ${day?.label ?? 'Gym'}`
}

function SetLine({ set, index, esPausaEx, esPesoCorpEx }) {
  const soloReps  = esPausaEx || esPesoCorpEx
  const repsLabel = esPausaEx ? 'seg' : 'reps'

  return (
    <div className="flex items-center gap-2 py-1 border-b border-slate-700/40 last:border-0">
      <span className="text-xs text-slate-500 w-14 shrink-0">Serie {index + 1}</span>
      <span className="text-sm text-slate-200 tabular-nums">
        {soloReps
          ? `${set.reps} ${repsLabel}`
          : `${set.weightKg} kg × ${set.reps} reps`}
      </span>
    </div>
  )
}

function ExerciseDetail({ ex }) {
  const ej          = resolverEjercicio(ex.exerciseId)
  const nombre      = ej?.nombre ?? ex.exerciseId
  const esPausaEx   = PAUSA_IDS.has(ex.exerciseId)
  const esPesoCorpEx = ej?.equipo === 'peso-corporal'

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50
                      rounded-t-xl">
        {ej?.gif && (
          <img src={ej.gif} alt={nombre}
            className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-700" />
        )}
        <p className="text-sm font-semibold text-slate-200">{nombre}</p>
      </div>
      <div className="px-4 pt-2 pb-3 rounded-b-xl">
        {ex.sets.map((set, i) => (
          <SetLine
            key={i}
            set={set}
            index={i}
            esPausaEx={esPausaEx}
            esPesoCorpEx={esPesoCorpEx}
          />
        ))}
      </div>
    </div>
  )
}

export default function ModalDetalleSesion({ session, onClose, onEdited }) {
  const [editando, setEditando] = useState(false)

  if (!session) return null

  const fecha  = formatDateLong(session.startedAt || session.completedAt)
  const label  = sessionLabel(session)
  const sets   = (session.exercises ?? []).reduce((acc, ex) => acc + ex.sets.length, 0)

  async function handleSaveEdit(updatedExercises) {
    await updateSession(session.id, updatedExercises)
    setEditando(false)
    onEdited?.()   // avisa al padre para que recargue y muestre toast
  }

  if (editando) {
    return (
      <ModalEditarSesion
        session={session}
        onSave={handleSaveEdit}
        onClose={() => setEditando(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-800 shrink-0">
        <button onClick={onClose}
          className="text-xs text-slate-500 active:text-slate-300 py-1 pr-3">
          ← Volver
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100">{label}</p>
          <p className="text-xs text-slate-500">{fecha}</p>
        </div>
        <button
          onClick={() => setEditando(true)}
          className="text-xs font-semibold text-brand-400 active:text-brand-300 py-1 pl-3 shrink-0"
        >
          ✏️ Editar
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="flex gap-3 px-5 py-3 border-b border-slate-800 shrink-0">
        {session.durationSeconds > 0 && (
          <div className="flex flex-col items-center flex-1">
            <span className="text-base font-bold text-slate-100 tabular-nums">
              {formatDuration(session.durationSeconds)}
            </span>
            <span className="text-xs text-slate-500">duración</span>
          </div>
        )}
        <div className="flex flex-col items-center flex-1">
          <span className="text-base font-bold text-slate-100">{sets}</span>
          <span className="text-xs text-slate-500">series</span>
        </div>
        {session.volumeKg > 0 && (
          <div className="flex flex-col items-center flex-1">
            <span className="text-base font-bold text-violet-400 tabular-nums">
              {formatVolume(session.volumeKg)}
            </span>
            <span className="text-xs text-slate-500">volumen</span>
          </div>
        )}
      </div>

      {/* Lista de ejercicios */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {(session.exercises ?? []).map(ex => (
          <ExerciseDetail key={ex.exerciseId} ex={ex} />
        ))}
      </div>

      {/* Pie */}
      <div className="px-4 pb-6 pt-3 border-t border-slate-800 shrink-0">
        <button
          onClick={() => setEditando(true)}
          className="w-full rounded-2xl border border-slate-600 py-3.5 text-sm
                     font-semibold text-slate-300 active:bg-slate-800 transition-colors"
        >
          ✏️ Editar sesión
        </button>
      </div>
    </div>
  )
}
