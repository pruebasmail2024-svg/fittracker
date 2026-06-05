import { useState, useCallback } from 'react'
import { formatDateLong } from '../utils/date'
import { resolverEjercicio } from '../services/rutinaService'
import { getRutina } from '../services/rutinaService'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAUSA_IDS = new Set(['plancha', 'farmers-walk'])

function esPausa(exerciseId) {
  return PAUSA_IDS.has(exerciseId)
}

function esPesoCorporal(exerciseId) {
  const ej = resolverEjercicio(exerciseId)
  return ej?.equipo === 'peso-corporal'
}

function sessionLabel(session) {
  const type = session.sessionType ?? 'gym'
  if (type === 'home_extra') return '🏠 Casa — complemento'
  if (type === 'home_replacement') {
    const rutina = getRutina()
    const day    = rutina[session.dayIndex]
    return `🏠 Casa — reemplazó ${day?.label ?? ''}`
  }
  const rutina = getRutina()
  const day    = rutina[session.dayIndex]
  return `🏋️ ${day?.label ?? 'Gym'}`
}

// ─── Componente de una serie editable ────────────────────────────────────────

function SetRow({ set, index, esPausaEx, esPesoCorpEx, onChange }) {
  const soloReps = esPausaEx || esPesoCorpEx
  const repsLabel = esPausaEx ? 'seg' : 'reps'

  return (
    <div className="flex items-center gap-2 bg-slate-700/40 rounded-xl px-3 py-2">
      <span className="text-xs text-slate-500 w-14 shrink-0">Serie {index + 1}</span>

      {!soloReps && (
        <>
          <input
            type="number"
            inputMode="decimal"
            value={set.weightKg}
            onChange={e => onChange(index, 'weightKg', e.target.value)}
            className="w-16 bg-slate-700 border border-slate-600 rounded-lg text-sm
                       text-slate-200 text-center py-1.5 focus:outline-none
                       focus:border-brand-500 tabular-nums"
          />
          <span className="text-xs text-slate-500 shrink-0">kg ×</span>
        </>
      )}

      <input
        type="number"
        inputMode="numeric"
        value={set.reps}
        onChange={e => onChange(index, 'reps', e.target.value)}
        className="w-14 bg-slate-700 border border-slate-600 rounded-lg text-sm
                   text-slate-200 text-center py-1.5 focus:outline-none
                   focus:border-brand-500 tabular-nums flex-1"
      />
      <span className="text-xs text-slate-500 shrink-0">{repsLabel}</span>
    </div>
  )
}

// ─── Bloque de un ejercicio (expandible) ─────────────────────────────────────

function ExerciseBlock({ exData, onSetChange }) {
  const [expanded, setExpanded] = useState(true)

  const ej          = resolverEjercicio(exData.exerciseId)
  const nombre      = ej?.nombre ?? exData.exerciseId
  const esPausaEx   = esPausa(exData.exerciseId)
  const esPesoCorpEx = esPesoCorporal(exData.exerciseId)

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
      {/* Header del ejercicio */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 active:bg-slate-700
                   transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {ej?.gif && (
            <img src={ej.gif} alt={nombre}
              className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-700" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{nombre}</p>
            <p className="text-xs text-slate-500">{exData.sets.length} series</p>
          </div>
        </div>
        <span className="text-slate-500 text-sm shrink-0 ml-2">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Series editables */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {exData.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              index={i}
              esPausaEx={esPausaEx}
              esPesoCorpEx={esPesoCorpEx}
              onChange={(setIdx, field, value) => onSetChange(exData.exerciseId, setIdx, field, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function ModalEditarSesion({ session, onSave, onClose }) {
  // Copia profunda de los ejercicios para edición local
  const [exercises, setExercises] = useState(
    () => session.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s })),
    }))
  )
  const [dirty, setDirty]           = useState(false)
  const [showExitWarn, setExitWarn] = useState(false)

  const handleSetChange = useCallback((exerciseId, setIdx, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex
      const sets = ex.sets.map((s, i) =>
        i === setIdx ? { ...s, [field]: Number(value) } : s
      )
      return { ...ex, sets }
    }))
    setDirty(true)
  }, [])

  function handleCancel() {
    if (dirty) { setExitWarn(true); return }
    onClose()
  }

  function handleSave() {
    onSave(exercises)
  }

  const fecha = formatDateLong(session.startedAt || session.completedAt)
  const label = sessionLabel(session)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">

      {/* Header fijo */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-800 shrink-0">
        <button onClick={handleCancel}
          className="text-xs text-slate-500 active:text-slate-300 py-1 pr-3">
          ← Cancelar
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">{label}</p>
          <p className="text-xs text-slate-500">{fecha}</p>
        </div>
        <button
          onClick={handleSave}
          className="text-sm font-bold text-brand-400 active:text-brand-300 py-1 pl-3 shrink-0"
        >
          Guardar
        </button>
      </div>

      {/* Lista de ejercicios scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {exercises.map(ex => (
          <ExerciseBlock
            key={ex.exerciseId}
            exData={ex}
            onSetChange={handleSetChange}
          />
        ))}
      </div>

      {/* Botón Guardar cambios al pie */}
      <div className="px-4 pb-6 pt-3 border-t border-slate-800 shrink-0">
        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-brand-500 py-4 text-base font-bold text-white
                     active:bg-brand-600 transition-colors"
        >
          Guardar cambios
        </button>
      </div>

      {/* Aviso de cambios sin guardar */}
      {showExitWarn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center
                        bg-black/70 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700
                          rounded-3xl px-6 py-6 flex flex-col gap-4">
            <p className="text-base font-bold text-slate-100 text-center">
              Tenés cambios sin guardar
            </p>
            <p className="text-sm text-slate-400 text-center">
              ¿Salir igual y perder los cambios?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-red-500/20 border border-red-500/40
                           py-3 text-sm font-bold text-red-400 active:bg-red-500/30"
              >
                Sí, salir
              </button>
              <button
                onClick={() => setExitWarn(false)}
                className="w-full rounded-xl border border-slate-600 py-3 text-sm
                           text-slate-400 active:bg-slate-800"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
