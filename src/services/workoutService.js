import { dbPromise } from './db'
import { createWorkoutSession } from '../models/workoutSession'

export async function saveWorkoutSession({ dayIndex, startedAt, exercises, durationSeconds = 0, sessionType = 'gym' }) {
  const db = await dbPromise
  return db.add('workoutSessions', createWorkoutSession({ dayIndex, startedAt, exercises, durationSeconds, sessionType }))
}

/** Todas las sesiones ordenadas por fecha ascendente. */
export async function getAllSessions() {
  const db = await dbPromise
  return db.getAllFromIndex('workoutSessions', 'by_date')
}

/**
 * Devuelve la sesión más reciente del mismo día para mostrar
 * los pesos/reps de referencia (sobrecarga progresiva).
 */
export async function getLastSessionByDay(dayIndex) {
  const all    = await getAllSessions()
  const forDay = all.filter(s => s.dayIndex === dayIndex)
  return forDay.at(-1) ?? null
}

/**
 * Actualiza una sesión existente en IndexedDB (edición in-place).
 * Recalcula volumeKg y agrega el campo editadaEl con el timestamp actual.
 *
 * @param {number} id        - ID autoincremental de la sesión
 * @param {Array}  exercises - Array actualizado de ejercicios con sus sets
 */
export async function updateSession(id, exercises) {
  const db      = await dbPromise
  const session = await db.get('workoutSessions', id)
  if (!session) throw new Error(`Sesión ${id} no encontrada`)

  const volumeKg = exercises.reduce((total, ex) =>
    total + ex.sets.reduce((t, s) => t + Number(s.weightKg) * Number(s.reps), 0),
  0)

  const updated = {
    ...session,
    exercises,
    volumeKg:  Math.round(volumeKg),
    editadaEl: new Date().toISOString(),
  }

  return db.put('workoutSessions', updated)
}

/**
 * Elimina una sesión de IndexedDB por su ID.
 *
 * @param {number} id - ID autoincremental de la sesión
 */
export async function deleteSession(id) {
  const db = await dbPromise
  return db.delete('workoutSessions', id)
}
