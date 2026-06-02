import { unzipSync, strFromU8 } from 'fflate'
import { dbPromise } from './db'

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
    let exercise   = session.exercises.find(e => e.exerciseId === row.ejercicio)
    if (!exercise) {
      exercise = { exerciseId: row.ejercicio, sets: [] }
      session.exercises.push(exercise)
    }
    exercise.sets.push({
      weightKg: Number(row.peso_kg)  || 0,
      reps:     Number(row.repeticiones) || 0,
    })
  })
  return Array.from(map.values())
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Parsea el ZIP seleccionado por el usuario y devuelve un preview
 * con los conteos + los datos listos para importar.
 * Lanza un Error descriptivo si el ZIP no es válido.
 */
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

  const pesoCsv  = parseCSV(strFromU8(unzipped['peso_corporal.csv']))
  const entCsv   = parseCSV(strFromU8(unzipped['entrenamientos.csv']))
  const consCsv  = parseCSV(strFromU8(unzipped['consistencia_semanal.csv']))

  // Validación básica de columnas
  if (pesoCsv.length > 0 && !('peso_kg' in pesoCsv[0])) {
    throw new Error('peso_corporal.csv no tiene el formato esperado (columnas: fecha, peso_kg).')
  }
  if (entCsv.length > 0 && !('ejercicio' in entCsv[0])) {
    throw new Error('entrenamientos.csv no tiene el formato esperado.')
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

/**
 * Borra los datos actuales en IndexedDB y los reemplaza con los del backup.
 * La consistencia no se importa porque es un dato calculado.
 */
export async function confirmImport({ pesoCsv, sessions }) {
  const db = await dbPromise

  // Limpiar weightLogs
  const tx1 = db.transaction('weightLogs', 'readwrite')
  await tx1.store.clear()
  await tx1.done

  // Limpiar workoutSessions
  const tx2 = db.transaction('workoutSessions', 'readwrite')
  await tx2.store.clear()
  await tx2.done

  // Reinsertar peso
  const tx3 = db.transaction('weightLogs', 'readwrite')
  for (const row of pesoCsv) {
    await tx3.store.add({
      weightKg:   Number(row.peso_kg) || 0,
      recordedAt: `${row.fecha}T12:00:00.000Z`,
    })
  }
  await tx3.done

  // Reinsertar sesiones
  const tx4 = db.transaction('workoutSessions', 'readwrite')
  for (const session of sessions) {
    await tx4.store.add(session)
  }
  await tx4.done
}
