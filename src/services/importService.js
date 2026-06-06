import { unzipSync, strFromU8 } from 'fflate'
import { supabase } from '../lib/supabase'

const REQUIRED = ['peso_corporal.csv', 'entrenamientos.csv', 'consistencia_semanal.csv']

// ─── Parser CSV ───────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').trim().split('\n').filter(l => l.trim())
  if (lines.length < 1) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']))
  })
}

// ─── Reconstrucción de sesiones desde CSV plano ───────────────────────────────

function csvToSessions(rows) {
  const map = new Map()
  rows.forEach(row => {
    const key = `${row.fecha}_${row.dia}`
    if (!map.has(key)) {
      map.set(key, {
        dayIndex:    Number(row.dia),
        startedAt:   `${row.fecha}T12:00:00.000Z`,
        completedAt: `${row.fecha}T12:00:00.000Z`,
        exercises:   [],
      })
    }
    const session  = map.get(key)
    let exercise   = session.exercises.find(e => e.exerciseId === row.ejercicio_id)
    if (!exercise) {
      exercise = { exerciseId: row.ejercicio_id || row.ejercicio, sets: [] }
      session.exercises.push(exercise)
    }
    exercise.sets.push({
      weightKg: Number(row.peso_kg)      || 0,
      reps:     Number(row.repeticiones) || 0,
    })
  })
  return Array.from(map.values())
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function parseBackupZip(file) {
  let unzipped
  try {
    const buffer = await file.arrayBuffer()
    unzipped = unzipSync(new Uint8Array(buffer))
  } catch {
    throw new Error('El archivo no es un ZIP válido.')
  }

  const fileNames = Object.keys(unzipped)
  const missing   = REQUIRED.filter(f => !fileNames.includes(f))
  if (missing.length > 0) {
    throw new Error(`El ZIP no tiene el formato correcto. Archivos faltantes: ${missing.join(', ')}.`)
  }

  const pesoCsv = parseCSV(strFromU8(unzipped['peso_corporal.csv']))
  const entCsv  = parseCSV(strFromU8(unzipped['entrenamientos.csv']))
  const consCsv = parseCSV(strFromU8(unzipped['consistencia_semanal.csv']))

  if (pesoCsv.length > 0 && !('peso_kg' in pesoCsv[0])) {
    throw new Error('peso_corporal.csv no tiene el formato esperado (columnas: fecha, peso_kg).')
  }

  const sessions = csvToSessions(entCsv)

  return {
    preview: {
      pesoCount:    pesoCsv.length,
      sessionCount: sessions.length,
      weeksCount:   consCsv.length,
    },
    data: { pesoCsv, sessions },
  }
}

export async function confirmImport({ pesoCsv, sessions }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay usuario autenticado.')

  // Limpiar datos existentes
  await supabase.from('weight_logs').delete().eq('user_id', user.id)
  await supabase.from('workout_sessions').delete().eq('user_id', user.id)

  // Reinsertar peso
  if (pesoCsv.length > 0) {
    const weightRows = pesoCsv.map(row => ({
      user_id: user.id,
      peso_kg: Number(row.peso_kg) || 0,
      fecha:   `${row.fecha}T12:00:00.000Z`,
    }))
    const { error } = await supabase.from('weight_logs').insert(weightRows)
    if (error) throw error
  }

  // Reinsertar sesiones
  if (sessions.length > 0) {
    const sessionRows = sessions.map(s => ({
      user_id:          user.id,
      day_index:        s.dayIndex,
      started_at:       s.startedAt,
      completed_at:     s.completedAt,
      exercises:        s.exercises,
      session_type:     'gym',
      volume_kg:        s.exercises.reduce((t, ex) =>
        t + ex.sets.reduce((st, set) => st + Number(set.weightKg) * Number(set.reps), 0), 0),
      duration_seconds: 0,
    }))
    const { error } = await supabase.from('workout_sessions').insert(sessionRows)
    if (error) throw error
  }
}
