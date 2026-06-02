import { dbPromise } from './db'
import { createWeightLog } from '../models/weightLog'

export async function addWeightLog({ weightKg, recordedAt }) {
  const db = await dbPromise
  return db.add('weightLogs', createWeightLog({ weightKg, recordedAt }))
}

export async function getAllWeightLogs() {
  const db = await dbPromise
  // Devuelve todos los registros ordenados por fecha ascendente
  return db.getAllFromIndex('weightLogs', 'by_date')
}
