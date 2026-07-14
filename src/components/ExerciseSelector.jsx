import { useState, useEffect } from 'react'
import { getAllSessions }             from '../services/workoutService'
import { resolverEjercicio, idCanonico } from '../services/rutinaService'
import { useAuth }                    from '../contexts/AuthContext'

/**
 * Selector de ejercicio que muestra únicamente los ejercicios
 * que tienen al menos una sesión registrada en el historial.
 * Resuelve nombre y datos desde el catálogo por exerciseId.
 * Si un ejercicio no está en el catálogo (legacy), muestra el ID como fallback.
 */
export default function ExerciseSelector({ value, onChange }) {
  const { user }                = useAuth()
  const [opciones, setOpciones] = useState([])
  const [debug, setDebug]       = useState('sin correr')

  useEffect(() => {
    if (!user) { setDebug('user = null'); return }
    getAllSessions(user.id).then(sessions => {
      // Recolectar los exerciseId únicos (canónicos) con al menos 1 sesión.
      // Normalizar a canónico une historial viejo + nuevo del mismo ejercicio.
      const idsSeen = new Set()
      sessions.forEach(s =>
        (s.exercises ?? []).forEach(ex => idsSeen.add(idCanonico(ex.exerciseId)))
      )

      // Resolver cada ID contra el catálogo y armar la lista
      const lista = [...idsSeen]
        .map(id => {
          const ej = resolverEjercicio(id)
          return {
            id,
            nombre: ej?.nombre ?? id,   // fallback al ID si no está en catálogo
            musculo: ej?.musculo ?? '',
          }
        })
        .sort((a, b) => {
          // Ordenar por músculo primero, luego por nombre
          if (a.musculo < b.musculo) return -1
          if (a.musculo > b.musculo) return 1
          return a.nombre.localeCompare(b.nombre)
        })

      setDebug(`sesiones=${sessions.length} · ids=${idsSeen.size} · opciones=${lista.length}`)
      setOpciones(lista)
    }).catch(err => {
      console.error('ExerciseSelector error:', err)
      setDebug(`ERROR: ${err?.message ?? err}`)
    })
  }, [user])

  // Agrupar por músculo para el <optgroup>
  const grupos = opciones.reduce((acc, ex) => {
    const grupo = ex.musculo || 'Otros'
    if (!acc[grupo]) acc[grupo] = []
    acc[grupo].push(ex)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Ejercicio
      </label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3
                   text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
      >
        <option value="">Seleccioná un ejercicio…</option>
        {Object.entries(grupos).map(([grupo, ejercicios]) => (
          <optgroup key={grupo} label={grupo.charAt(0).toUpperCase() + grupo.slice(1)}>
            {ejercicios.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.nombre}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {opciones.length === 0 && (
        <p className="text-xs text-slate-600">
          Registrá sesiones para ver tu historial de ejercicios.
        </p>
      )}
      <p className="text-[10px] text-amber-500 font-mono break-all">🐞 {debug}</p>
    </div>
  )
}
