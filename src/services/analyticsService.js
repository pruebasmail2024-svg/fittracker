// ─── Detección de estancamiento ──────────────────────────────────────────────

const getMaxWeight = (session, exerciseId) => {
  const ex = session.exercises.find(e => e.exerciseId === exerciseId)
  if (!ex || ex.sets.length === 0) return 0
  return Math.max(...ex.sets.map(s => Number(s.weightKg)))
}

const getMaxReps = (session, exerciseId) => {
  const ex = session.exercises.find(e => e.exerciseId === exerciseId)
  if (!ex || ex.sets.length === 0) return 0
  return Math.max(...ex.sets.map(s => Number(s.reps)))
}

/**
 * Devuelve true si en las últimas 3 sesiones del mismo día
 * no hubo mejora ni en peso máximo ni en reps máximas.
 */
export function detectStagnation(exerciseId, dayIndex, allSessions) {
  const relevant = allSessions
    .filter(s => s.dayIndex === dayIndex &&
      s.exercises.some(e => e.exerciseId === exerciseId))
    .slice(-3)

  if (relevant.length < 3) return false

  const weights = relevant.map(s => getMaxWeight(s, exerciseId))
  const reps    = relevant.map(s => getMaxReps(s, exerciseId))

  // Sin progreso: el valor más reciente no supera al más antiguo de los 3
  return weights[2] <= weights[0] && reps[2] <= reps[0]
}

// ─── Proyección de peso corporal (hardgainer) ────────────────────────────────

const MONTHLY_GAINS = { 1: 2.0, 2: 1.0, 3: 1.0 }  // mes → kg ganados

export function generateWeightProjection(startDate, startWeightKg, months = 13) {
  const points = []
  let weight   = Number(startWeightKg)
  const start  = new Date(startDate)

  for (let m = 0; m <= months; m++) {
    const d = new Date(start)
    d.setMonth(d.getMonth() + m)
    if (m > 0) {
      weight += MONTHLY_GAINS[m] ?? 0.5
    }
    points.push({
      date:      d.toISOString().split('T')[0],
      projected: Math.round(weight * 10) / 10,
    })
  }
  return points
}

// ─── Variantes de rotación (cada 120 días) ───────────────────────────────────

export const ROTATION_VARIANTS = {
  'squat':               'Sentadilla en máquina / Prensa de piernas',
  'lat-pulldown':        'Dominadas con asistencia',
  'bench-press':         'Press de Pecho con mancuernas',
  'romanian-deadlift':   'Buenos días con barra',
  'overhead-press':      'Press Militar con mancuernas',
  'barbell-row':         'Remo en máquina / Remo con mancuerna',
  'lunge':               'Zancadas inversas / Step-up',
  'incline-bench-press': 'Press Inclinado con mancuernas',
  'bicep-curl':          'Curl martillo con mancuernas',
  'tricep-extension':    'Fondos en paralelas',
}
