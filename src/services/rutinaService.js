import { buscarEjercicioPorId } from '../hooks/useEjerciciosCatalogo'

// ─── Mapa de compatibilidad: IDs viejos → IDs del catálogo nuevo ─────────────
// Los ejercicios farmers-walk e incline-bench-press no tienen equivalente en el
// catálogo nuevo, por eso conservan su ID "legacy" y apuntan a su GIF original.
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

// Ejercicios sin equivalente en el catálogo — se usan tal cual del plan original
const LEGACY_EXERCISES = {
  'farmers-walk': {
    id:           'farmers-walk',
    nombre:       'Caminata del Granjero',
    gif:          '/exercises/farmers-walk.gif',
    musculo:      'otro',
    musculosSecundarios: [],
    equipo:       'mancuernas',
    lugar:        ['gimnasio'],
    mecanica:     'compuesto',
    nivel:        'principiante',
    cues:         'Tomá las mancuernas con agarre firme, hombros atrás y abajo, pecho erguido. Caminá a paso firme y controlado sin dejar que el torso se incline a los lados.',
    commonError:  'No encorves los hombros hacia adelante bajo la carga.',
  },
  'incline-bench-press': {
    id:           'incline-bench-press',
    nombre:       'Press Inclinado',
    gif:          '/exercises/incline-bench-press.gif',
    musculo:      'pecho',
    musculosSecundarios: ['hombros', 'triceps'],
    equipo:       'barra',
    lugar:        ['gimnasio'],
    mecanica:     'compuesto',
    nivel:        'principiante',
    cues:         'Banco a 30–45°. Bajá la barra hasta el pecho alto (debajo de la clavícula), codos a 60° del torso. Empujá de forma controlada sin bloquear los codos.',
    commonError:  'No subas demasiado el ángulo del banco — pierde efectividad en el pecho.',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resuelve un exerciseId (viejo o nuevo) a un objeto de ejercicio del catálogo.
 * Primero traduce el ID viejo si corresponde, luego busca en el catálogo.
 * Si no está en el catálogo, devuelve el ejercicio legacy.
 */
export function resolverEjercicio(exerciseId) {
  const nuevoId = COMPAT_MAP[exerciseId] ?? exerciseId
  const delCatalogo = buscarEjercicioPorId(nuevoId)
  if (delCatalogo) return delCatalogo
  return LEGACY_EXERCISES[exerciseId] ?? LEGACY_EXERCISES[nuevoId] ?? null
}

// ─── Rutina default (mapeo de workoutPlan.js a IDs del catálogo nuevo) ────────

const RUTINA_DEFAULT = [
  {
    dayIndex: 0,
    label:    'Día 1',
    focus:    'Full Body — Empuje / Tirón',
    slots: [
      { posicion: 0, exerciseId: 'sentadilla-con-barra',        sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'jalon-al-pecho',              sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'press-de-banca-con-barra',    sets: 3, repsMin: 8,  repsMax: 10, esPausa: false },
      { posicion: 3, exerciseId: 'farmers-walk',                sets: 3, repsMin: 40, repsMax: 40, esPausa: true  },
    ],
  },
  {
    dayIndex: 1,
    label:    'Día 2',
    focus:    'Full Body — Posterior / Core',
    slots: [
      { posicion: 0, exerciseId: 'peso-muerto-rumano',          sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'press-militar-con-barra',     sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'remo-con-barra',              sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 3, exerciseId: 'plancha',                     sets: 3, repsMin: 45, repsMax: 45, esPausa: true  },
    ],
  },
  {
    dayIndex: 2,
    label:    'Día 3',
    focus:    'Full Body — Brazos / Piernas',
    slots: [
      { posicion: 0, exerciseId: 'zancadas-con-mancuernas',     sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 1, exerciseId: 'incline-bench-press',         sets: 3, repsMin: 10, repsMax: 10, esPausa: false },
      { posicion: 2, exerciseId: 'curl-con-barra',              sets: 3, repsMin: 12, repsMax: 12, esPausa: false },
      { posicion: 3, exerciseId: 'extension-de-triceps-con-mancuerna', sets: 3, repsMin: 12, repsMax: 12, esPausa: false },
    ],
  },
]

const STORAGE_KEY = 'fittracker_rutina'

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve la rutina activa del usuario.
 * Si nunca personalizó, devuelve la rutina default.
 *
 * @returns {Array} Array de 3 días con sus slots
 */
export function getRutina() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return RUTINA_DEFAULT
    return JSON.parse(raw)
  } catch {
    return RUTINA_DEFAULT
  }
}

/**
 * Actualiza un slot específico de un día.
 * Permite cambiar exerciseId, sets, repsMin, repsMax, esPausa.
 *
 * @param {number} dayIndex    - 0, 1 o 2
 * @param {number} slotIndex   - posición del slot dentro del día
 * @param {Object} cambios     - campos a actualizar
 */
export function updateSlot(dayIndex, slotIndex, cambios) {
  const rutina = getRutina()
  rutina[dayIndex].slots[slotIndex] = {
    ...rutina[dayIndex].slots[slotIndex],
    ...cambios,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rutina))
}

/**
 * Restaura un día a su configuración default original.
 * No toca los otros días ni el historial de ejercicios.
 *
 * @param {number} dayIndex - 0, 1 o 2
 */
export function resetDia(dayIndex) {
  const rutina = getRutina()
  rutina[dayIndex] = structuredClone(RUTINA_DEFAULT[dayIndex])
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rutina))
}

/**
 * Convierte un día de la rutina en el formato "plano" que usa useWorkoutSession:
 * lista de ejercicios con todos los campos del catálogo + sets/repsLabel/pairLabel.
 *
 * Los slots se agrupan de a pares (como en el workoutPlan original) para conservar
 * el concepto de "superseries antagónicas" en la UI de sesión.
 *
 * @param {number} dayIndex
 * @returns {Array} Ejercicios planos listos para useWorkoutSession
 */
export function getDiaParaSesion(dayIndex) {
  const dia = getRutina()[dayIndex]
  const slots = dia.slots

  // Agrupar de a pares para construir el pairLabel (misma lógica que workoutPlan)
  const resultado = slots.map((slot, i) => {
    const ejercicio = resolverEjercicio(slot.exerciseId)
    if (!ejercicio) return null

    const repsLabel = slot.esPausa
      ? `${slot.repsMin} segundos`
      : slot.repsMin === slot.repsMax
        ? `${slot.repsMin} reps`
        : `${slot.repsMin}–${slot.repsMax} reps`

    // Par: este slot + el siguiente (si existe), para armar el label "A + B"
    const parCompañero = i % 2 === 0 ? slots[i + 1] : slots[i - 1]
    const compañeroEj  = parCompañero ? resolverEjercicio(parCompañero.exerciseId) : null
    const pairLabel    = compañeroEj
      ? [ejercicio.nombre, compañeroEj.nombre].join(' + ')
      : ejercicio.nombre

    return {
      id:         ejercicio.id,
      name:       ejercicio.nombre,
      gif:        ejercicio.gif,
      sets:       slot.sets,
      repsLabel,
      muscles:    [ejercicio.musculo, ...ejercicio.musculosSecundarios].join(', '),
      cues:       ejercicio.cues,
      commonError: ejercicio.commonError,
      esPausa:    slot.esPausa,
      pairLabel,
    }
  })

  return resultado.filter(Boolean)
}
