import { useState } from 'react'
import { getRutina, updateSlot, resetDia, resolverEjercicio } from '../services/rutinaService'
import { filtrarEjercicios } from '../hooks/useEjerciciosCatalogo'

// ─── Modal selector de ejercicios ────────────────────────────────────────────

const OPCIONES_MUSCULO = [
  { value: '',               label: 'Todos los músculos' },
  { value: 'abdominales',    label: 'Abdominales' },
  { value: 'biceps',         label: 'Bíceps' },
  { value: 'cuadriceps',     label: 'Cuádriceps' },
  { value: 'espalda',        label: 'Espalda' },
  { value: 'gemelos',        label: 'Gemelos' },
  { value: 'gluteos',        label: 'Glúteos' },
  { value: 'hombros',        label: 'Hombros' },
  { value: 'isquiotibiales', label: 'Isquiotibiales' },
  { value: 'pecho',          label: 'Pecho' },
  { value: 'triceps',        label: 'Tríceps' },
]

const OPCIONES_EQUIPO = [
  { value: '',              label: 'Todo el equipo' },
  { value: 'barra',         label: 'Barra' },
  { value: 'mancuernas',    label: 'Mancuernas' },
  { value: 'maquina',       label: 'Máquina' },
  { value: 'polea',         label: 'Polea' },
  { value: 'peso-corporal', label: 'Peso corporal' },
  { value: 'kettlebell',    label: 'Kettlebell' },
  { value: 'barra-z',       label: 'Barra Z' },
]

function ModalSelectorEjercicio({ musculoInicial, onSelect, onClose }) {
  const [musculo, setMusculo] = useState(musculoInicial ?? '')
  const [equipo,  setEquipo]  = useState('')
  const [lugar,   setLugar]   = useState('')

  const ejercicios = filtrarEjercicios({
    musculo: musculo || undefined,
    equipo:  equipo  || undefined,
    lugar:   lugar   || undefined,
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[90vh]
                      flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-base font-bold text-slate-100">Elegí un ejercicio</h3>
          <button onClick={onClose} className="text-slate-500 text-2xl leading-none active:text-slate-300">×</button>
        </div>

        {/* Filtros */}
        <div className="px-4 py-3 border-b border-slate-800 shrink-0 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto">
            <select value={musculo} onChange={e => setMusculo(e.target.value)}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2
                         text-xs text-slate-200 focus:outline-none focus:border-brand-500 shrink-0">
              {OPCIONES_MUSCULO.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
            <select value={equipo} onChange={e => setEquipo(e.target.value)}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2
                         text-xs text-slate-200 focus:outline-none focus:border-brand-500 shrink-0">
              {OPCIONES_EQUIPO.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
            <select value={lugar} onChange={e => setLugar(e.target.value)}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2
                         text-xs text-slate-200 focus:outline-none focus:border-brand-500 shrink-0">
              <option value="">Gym y casa</option>
              <option value="gimnasio">Solo gym</option>
              <option value="casa">Solo casa</option>
            </select>
          </div>
          <p className="text-xs text-slate-600">{ejercicios.length} ejercicios</p>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
          {ejercicios.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Sin resultados para esos filtros.</p>
          )}
          {ejercicios.map(ex => (
            <button key={ex.id} onClick={() => onSelect(ex.id)}
              className="w-full text-left rounded-xl bg-slate-800 border border-slate-700
                         px-4 py-3 active:bg-slate-700 transition-colors flex items-center gap-3">
              <img src={ex.gif} alt={ex.nombre}
                className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{ex.nombre}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {[ex.musculo, ...(ex.musculosSecundarios ?? [])].join(', ')}
                </p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{ex.equipo}</span>
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{ex.nivel}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Vista de edición de un día ───────────────────────────────────────────────

function EditarDia({ dayIndex, rutina, onCambio, onReset, onBack }) {
  const [confirmandoReset, setConfirmandoReset] = useState(false)
  const [cambiandoSlot, setCambiandoSlot]       = useState(null) // { slotIndex, musculoActual }

  const dia = rutina[dayIndex]

  function handleCambiarEjercicio(slotIndex) {
    const ej = resolverEjercicio(dia.slots[slotIndex].exerciseId)
    setCambiandoSlot({ slotIndex, musculoActual: ej?.musculo ?? '' })
  }

  function handleSeleccionarEjercicio(exerciseId) {
    onCambio(dayIndex, cambiandoSlot.slotIndex, { exerciseId })
    setCambiandoSlot(null)
  }

  function handleReset() {
    onReset(dayIndex)
    setConfirmandoReset(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header de edición */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs text-slate-500 active:text-slate-300 py-1">
          ← Volver
        </button>
        <h3 className="text-sm font-bold text-slate-200">{dia.label} — {dia.focus}</h3>
        <div className="w-16" />
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-3">
        {dia.slots.map((slot, slotIndex) => {
          const ej = resolverEjercicio(slot.exerciseId)
          if (!ej) return null

          const repsLabel = slot.esPausa
            ? `${slot.repsMin}s`
            : slot.repsMin === slot.repsMax
              ? `${slot.repsMin} reps`
              : `${slot.repsMin}–${slot.repsMax} reps`

          return (
            <div key={slotIndex}
              className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">

              {/* Cabecera del slot */}
              <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <img src={ej.gif} alt={ej.nombre}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{ej.nombre}</p>
                  <p className="text-xs text-slate-500">{slot.sets} series × {repsLabel}</p>
                </div>
                <button
                  onClick={() => handleCambiarEjercicio(slotIndex)}
                  className="text-xs text-brand-400 font-semibold shrink-0 active:text-brand-300
                             border border-brand-500/30 rounded-lg px-3 py-1.5"
                >
                  Cambiar
                </button>
              </div>

              {/* Edición de sets y reps */}
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="flex flex-col gap-0.5 items-center">
                  <label className="text-xs text-slate-600">Series</label>
                  <input
                    type="number" inputMode="numeric"
                    value={slot.sets}
                    onChange={e => onCambio(dayIndex, slotIndex, { sets: Number(e.target.value) || 1 })}
                    className="w-12 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1.5
                               text-slate-100 text-center text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                {!slot.esPausa && (
                  <>
                    <div className="flex flex-col gap-0.5 items-center">
                      <label className="text-xs text-slate-600">Rep mín</label>
                      <input
                        type="number" inputMode="numeric"
                        value={slot.repsMin}
                        onChange={e => onCambio(dayIndex, slotIndex, { repsMin: Number(e.target.value) || 1 })}
                        className="w-14 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1.5
                                   text-slate-100 text-center text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 items-center">
                      <label className="text-xs text-slate-600">Rep máx</label>
                      <input
                        type="number" inputMode="numeric"
                        value={slot.repsMax}
                        onChange={e => onCambio(dayIndex, slotIndex, { repsMax: Number(e.target.value) || 1 })}
                        className="w-14 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1.5
                                   text-slate-100 text-center text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </>
                )}
                {slot.esPausa && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <label className="text-xs text-slate-600">Segundos</label>
                    <input
                      type="number" inputMode="numeric"
                      value={slot.repsMin}
                      onChange={e => {
                        const v = Number(e.target.value) || 1
                        onCambio(dayIndex, slotIndex, { repsMin: v, repsMax: v })
                      }}
                      className="w-16 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1.5
                                 text-slate-100 text-center text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Restaurar defaults */}
      {confirmandoReset ? (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 flex flex-col gap-3">
          <p className="text-sm text-amber-400 font-semibold">
            ¿Restaurar el {dia.label} a la rutina original?
          </p>
          <p className="text-xs text-slate-400">Tu historial no se perderá.</p>
          <div className="flex gap-2">
            <button onClick={handleReset}
              className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white
                         active:bg-amber-600 transition-colors">
              Restaurar
            </button>
            <button onClick={() => setConfirmandoReset(false)}
              className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm text-slate-400
                         active:bg-slate-800 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirmandoReset(true)}
          className="text-xs text-slate-600 text-center active:text-slate-400 py-2">
          Restaurar {dia.label} a los ejercicios originales
        </button>
      )}

      {/* Modal para cambiar ejercicio */}
      {cambiandoSlot && (
        <ModalSelectorEjercicio
          musculoInicial={cambiandoSlot.musculoActual}
          onSelect={handleSeleccionarEjercicio}
          onClose={() => setCambiandoSlot(null)}
        />
      )}
    </div>
  )
}

// ─── Vista principal: 3 cards de días ────────────────────────────────────────

export default function MiRutina() {
  const [rutina, setRutina]       = useState(() => getRutina())
  const [editandoDia, setEditando] = useState(null) // null | 0 | 1 | 2

  function handleCambio(dayIndex, slotIndex, cambios) {
    updateSlot(dayIndex, slotIndex, cambios)
    setRutina(getRutina())
  }

  function handleReset(dayIndex) {
    resetDia(dayIndex)
    setRutina(getRutina())
  }

  if (editandoDia !== null) {
    return (
      <EditarDia
        dayIndex={editandoDia}
        rutina={rutina}
        onCambio={handleCambio}
        onReset={handleReset}
        onBack={() => setEditando(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {rutina.map((dia, dayIndex) => {
        return (
          <div key={dayIndex}
            className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">

            {/* Header del día */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-700/40">
              <div>
                <p className="text-sm font-bold text-slate-100">{dia.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{dia.focus}</p>
              </div>
              <button
                onClick={() => setEditando(dayIndex)}
                className="text-xs text-brand-400 font-semibold active:text-brand-300
                           border border-brand-500/30 rounded-lg px-3 py-1.5"
              >
                Editar día
              </button>
            </div>

            {/* Lista de ejercicios del día */}
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {dia.slots.map((slot, i) => {
                const ej = resolverEjercicio(slot.exerciseId)
                if (!ej) return null
                const repsLabel = slot.esPausa
                  ? `${slot.repsMin}s`
                  : slot.repsMin === slot.repsMax
                    ? `${slot.repsMin} reps`
                    : `${slot.repsMin}–${slot.repsMax} reps`

                return (
                  <div key={i} className="flex items-center gap-3">
                    <img src={ej.gif} alt={ej.nombre}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{ej.nombre}</p>
                      <p className="text-xs text-slate-500">{slot.sets}×{repsLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
