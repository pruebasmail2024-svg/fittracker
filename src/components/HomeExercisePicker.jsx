import { useState } from 'react'
import { filtrarEjercicios } from '../hooks/useEjerciciosCatalogo'

const OPCIONES_MUSCULO = [
  { value: '',               label: 'Todos' },
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
  { value: 'peso-corporal', label: 'Peso corporal' },
  { value: 'mancuernas',   label: 'Mancuernas' },
  { value: 'kettlebell',   label: 'Kettlebell' },
  { value: 'bandas',       label: 'Bandas' },
  { value: 'otro',         label: 'Otro' },
]

export default function HomeExercisePicker({ isOpen, onSelect, onClose }) {
  const [musculo, setMusculo] = useState('')
  const [equipo,  setEquipo]  = useState('')

  if (!isOpen) return null

  const ejercicios = filtrarEjercicios({ lugar: 'casa', musculo: musculo || undefined, equipo: equipo || undefined })

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[85vh]
                      flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-slate-100">Elegí un ejercicio</h3>
          <button
            onClick={onClose}
            className="text-slate-500 text-2xl leading-none active:text-slate-300"
          >
            ×
          </button>
        </div>

        {/* Filtros */}
        <div className="px-4 py-3 border-b border-slate-800 shrink-0 flex gap-2 overflow-x-auto">
          <select
            value={musculo}
            onChange={e => setMusculo(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2
                       text-sm text-slate-200 focus:outline-none focus:border-brand-500
                       shrink-0"
          >
            {OPCIONES_MUSCULO.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          <select
            value={equipo}
            onChange={e => setEquipo(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2
                       text-sm text-slate-200 focus:outline-none focus:border-brand-500
                       shrink-0"
          >
            {OPCIONES_EQUIPO.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
          {ejercicios.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              No hay ejercicios con esos filtros.
            </p>
          )}

          {ejercicios.map(ex => (
            <button
              key={ex.id}
              onClick={() => { onSelect(ex.id); onClose() }}
              className="w-full text-left rounded-xl bg-slate-800 border border-slate-700
                         px-4 py-3 active:bg-slate-700 transition-colors flex items-center gap-3"
            >
              {ex.gif && (
                <img
                  src={ex.gif}
                  alt={ex.nombre}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{ex.nombre}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {[ex.musculo, ...(ex.musculosSecundarios ?? [])].join(', ')}
                </p>
                <span className="inline-block mt-1 text-xs text-slate-500 bg-slate-700
                                 px-2 py-0.5 rounded-full">{ex.equipo}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
