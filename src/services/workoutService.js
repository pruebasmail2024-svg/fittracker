import { dbPromise } from './db'
import { createWorkoutSession } from '../models/workoutSession'

export async function saveWorkoutSession({ dayIndex, startedAt, exercises }) {
  const db = await dbPromise
  return db.add('workoutSessions', createWorkoutSession({ dayIndex, startedAt, exercises }))
}

/**
 * Devuelve la sesión más reciente del mismo día para mostrar
 * los pesos/reps de referencia (sobrecarga progresiva).
 */
export async function getLastSessionByDay(dayIndex) {
  const db = await dbPromise
  // Trae todas las sesiones ordenadas por fecha y filtra por día
  const all = await db.getAllFromIndex('workoutSessions', 'by_date')
  const forDay = all.filter(s => s.dayIndex === dayIndex)
  return forDay.at(-1) ?? null  // la más reciente
}
