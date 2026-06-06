import { supabase } from '../lib/supabase'

const OLD_DB_NAME    = 'training-longevity'
const MIGRATION_FLAG = 'fittracker_migration_offered'

/** Abre la base vieja SIN crear stores nuevos. Retorna null si no existe. */
async function openOldDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open(OLD_DB_NAME)
    req.onupgradeneeded = (e) => {
      // Si dispara upgrade, es una DB nueva — no hay datos viejos
      e.target.transaction.abort()
      resolve(null)
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = () => resolve(null)
  })
}

/** Verifica si hay datos en la IndexedDB vieja. */
export async function hasLegacyData() {
  if (localStorage.getItem(MIGRATION_FLAG)) return false
  try {
    const db = await openOldDB()
    if (!db) return false
    if (!db.objectStoreNames.contains('workoutSessions') &&
        !db.objectStoreNames.contains('weightLogs')) {
      db.close()
      return false
    }
    const tx       = db.transaction(['workoutSessions', 'weightLogs'], 'readonly')
    const sessions = await tx.objectStore('workoutSessions').getAll()
    const weights  = await tx.objectStore('weightLogs').getAll()
    db.close()
    return sessions.length > 0 || weights.length > 0
  } catch {
    return false
  }
}

/** Lee todos los datos de la IndexedDB vieja. */
async function readLegacyData() {
  const db = await openOldDB()
  if (!db) return { profile: null, sessions: [], weights: [] }

  const stores = Array.from(db.objectStoreNames)
  const result = { profile: null, sessions: [], weights: [] }

  if (stores.includes('profile')) {
    const tx  = db.transaction('profile', 'readonly')
    const all = await tx.objectStore('profile').getAll()
    result.profile = all[0] ?? null
  }
  if (stores.includes('workoutSessions')) {
    const tx = db.transaction('workoutSessions', 'readonly')
    result.sessions = await tx.objectStore('workoutSessions').getAll()
  }
  if (stores.includes('weightLogs')) {
    const tx = db.transaction('weightLogs', 'readonly')
    result.weights = await tx.objectStore('weightLogs').getAll()
  }

  db.close()
  return result
}

/** Sube todos los datos legacy a Supabase y marca la migración como hecha. */
export async function migrateLegacyData(onProgress) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sin usuario autenticado.')

  const { profile, sessions, weights } = await readLegacyData()

  // Perfil
  if (profile) {
    onProgress?.('Subiendo perfil…')
    await supabase.from('profiles').upsert({
      user_id:         user.id,
      edad:            profile.age,
      peso_inicial_kg: profile.weightKg,
      altura_cm:       profile.heightCm,
    })
  }

  // Registros de peso
  if (weights.length > 0) {
    onProgress?.(`Subiendo ${weights.length} registros de peso…`)
    const rows = weights.map(w => ({
      user_id: user.id,
      peso_kg: w.weightKg,
      fecha:   w.recordedAt,
    }))
    const { error } = await supabase.from('weight_logs').insert(rows)
    if (error) throw error
  }

  // Sesiones
  if (sessions.length > 0) {
    onProgress?.(`Subiendo ${sessions.length} sesiones…`)
    const rows = sessions.map(s => ({
      user_id:          user.id,
      day_index:        s.dayIndex,
      session_type:     s.sessionType ?? 'gym',
      exercises:        s.exercises,
      volume_kg:        s.volumeKg ?? 0,
      duration_seconds: s.durationSeconds ?? 0,
      started_at:       s.startedAt,
      completed_at:     s.completedAt,
      editada_el:       s.editadaEl ?? null,
    }))
    const { error } = await supabase.from('workout_sessions').insert(rows)
    if (error) throw error
  }

  onProgress?.('¡Listo!')
  markMigrationDone()
}

export function markMigrationDone() {
  localStorage.setItem(MIGRATION_FLAG, 'true')
}
