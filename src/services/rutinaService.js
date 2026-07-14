import { supabase } from '../lib/supabase'
import { buscarEjercicioPorId } from '../hooks/useEjerciciosCatalogo'

// ─── Mapa de compatibilidad: IDs viejos → IDs del catálogo nuevo ─────────────
const COMPAT_MAP = {
  'squat':              'sentadilla-con-barra',
  'bench-press':        'press-de-banca-con-barra',
  'lat-pulldown':       'jalon-al-pecho',
  'romanian-deadlift':  'peso-muerto-rumano',
  'overhead-press':     'press-militar-con-barra',
  'barbell-row':        'remo-con-barra',
  'plank':              'plancha',
  'lunge':              'zancadas-con-mancuernas',
  'bicep-curl':         'curl-con-barra',
  'tricep-extension':   'extension-de-triceps-con-mancuerna',
}

const LEGACY_EXERCISES = {
  'farmers-walk': {
    id:                  'farmers-walk',
    nombre:              'Caminata del Granjero',
    gif:                 '/exercises/farmers-walk.gif',
    musculo:             'otro',
    musculosSecundarios: [],
    equipo:              'mancuernas',
    lugar:               ['gimnasio'],
    mecanica:            'compuesto',
    nivel:               'principiante',
    cues:                'Tomá las mancuernas con agarre firme, hombros atrás y abajo, pecho erguido. Caminá a paso firme y controlado sin dejar que el torso se incline a los lados.',
    commonError:         'No encorves los hombros hacia adelante bajo la carga.',
  },
  'incline-bench-press': {
    id:                  'incline-bench-press',
    nombre:              'Press Inclinado',
    gif:                 '/exercises/incline-bench-press.gif',
    musculo:             'pecho',
    musculosSecundarios: ['hombros', 'triceps'],
    equipo:              'barra',
    lugar:               ['gimnasio'],
    mecanica:            'compuesto',
    nivel:               'principiante',
    cues:                'Banco a 30–45°. Bajá la barra hasta el pecho alto (debajo de la clavícula), codos a 60° del torso. Empujá de forma controlada sin bloquear los codos.',
    commonError:         'No subas demasiado el ángulo del banco — pierde efectividad en el pecho.',
  },
}

// ─── Rutina default ───────────────────────────────────────────────────────────

const RUTINA_DEFAULT = [
  {
    dayIndex: 0,
    label:    'Día 1',
    focus:    'Full Body — Empuje / Tirón',
    slots: [
      { posicion: 0, exerciseId: 'sentadilla-con-barra',                  sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'jalon-al-pecho',                        sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'press-de-banca-con-barra',              sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 3, exerciseId: 'farmers-walk',                          sets: 3, repsMin: 40, repsMax: 40, esPausa: true  },
    ],
  },
  {
    dayIndex: 1,
    label:    'Día 2',
    focus:    'Full Body — Posterior / Core',
    slots: [
      { posicion: 0, exerciseId: 'peso-muerto-rumano',                    sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'press-militar-con-barra',               sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'remo-con-barra',                        sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 3, exerciseId: 'plancha',                               sets: 3, repsMin: 45, repsMax: 45, esPausa: true  },
    ],
  },
  {
    dayIndex: 2,
    label:    'Día 3',
    focus:    'Full Body — Brazos / Piernas',
    slots: [
      { posicion: 0, exerciseId: 'zancadas-con-mancuernas',               sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'incline-bench-press',                   sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'curl-con-barra',                        sets: 3, repsMin: 12, repsMax: 12, esPausa: false },
      { posicion: 3, exerciseId: 'extension-de-triceps-con-mancuerna',    sets: 3, repsMin: 12, repsMax: 12, esPausa: false },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resolverEjercicio(exerciseId) {
  const nuevoId      = COMPAT_MAP[exerciseId] ?? exerciseId
  const delCatalogo  = buscarEjercicioPorId(nuevoId)
  if (delCatalogo) return delCatalogo
  return LEGACY_EXERCISES[exerciseId] ?? LEGACY_EXERCISES[nuevoId] ?? null
}

// Normaliza un exerciseId a su forma canónica (mapea IDs viejos → nuevos).
// Usarlo al comparar IDs de sesiones guardadas contra los de la rutina actual.
export function idCanonico(exerciseId) {
  return COMPAT_MAP[exerciseId] ?? exerciseId
}

// ─── API pública (async) ──────────────────────────────────────────────────────

export async function getRutina(userId) {
  const { data, error } = await supabase
    .from('rutinas')
    .select('rutina_json')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return structuredClone(RUTINA_DEFAULT)
    throw error
  }

  return data.rutina_json
}

async function saveRutina(userId, rutina) {
  const { error } = await supabase
    .from('rutinas')
    .upsert({ user_id: userId, rutina_json: rutina })

  if (error) throw error
}

export async function updateSlot(userId, dayIndex, slotIndex, cambios) {
  const rutina = await getRutina(userId)
  rutina[dayIndex].slots[slotIndex] = {
    ...rutina[dayIndex].slots[slotIndex],
    ...cambios,
  }
  await saveRutina(userId, rutina)
  return rutina
}

export async function resetDia(userId, dayIndex) {
  const rutina = await getRutina(userId)
  rutina[dayIndex] = structuredClone(RUTINA_DEFAULT[dayIndex])
  await saveRutina(userId, rutina)
  return rutina
}

export async function getDiaParaSesion(userId, dayIndex) {
  const rutina = await getRutina(userId)
  const dia    = rutina[dayIndex]
  const slots  = dia.slots

  const resultado = slots.map((slot, i) => {
    const ejercicio = resolverEjercicio(slot.exerciseId)
    if (!ejercicio) return null

    const repsLabel = slot.esPausa
      ? `${slot.repsMin} segundos`
      : slot.repsMin === slot.repsMax
        ? `${slot.repsMin} reps`
        : `${slot.repsMin}–${slot.repsMax} reps`

    const parCompañero = i % 2 === 0 ? slots[i + 1] : slots[i - 1]
    const compañeroEj  = parCompañero ? resolverEjercicio(parCompañero.exerciseId) : null
    const pairLabel    = compañeroEj
      ? [ejercicio.nombre, compañeroEj.nombre].join(' + ')
      : ejercicio.nombre

    return {
      id:          ejercicio.id,
      name:        ejercicio.nombre,
      gif:         ejercicio.gif,
      sets:        slot.sets,
      repsLabel,
      muscles:     [ejercicio.musculo, ...ejercicio.musculosSecundarios].join(', '),
      cues:        ejercicio.cues,
      commonError: ejercicio.commonError,
      esPausa:     slot.esPausa,
      pairLabel,
    }
  })

  return resultado.filter(Boolean)
}
