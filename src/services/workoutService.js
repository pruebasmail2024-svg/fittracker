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
