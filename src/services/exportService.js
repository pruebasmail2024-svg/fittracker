import { zipSync, strToU8 } from 'fflate'
import { getAllWeightLogs }  from './weightService'
import { getAllSessions }    from './workoutService'
import { getWeeklyScores }  from './consistencyService'
import { markBackupDownloaded } from './notificationService'
import { resolverEjercicio } from './rutinaService'

// ─── Helpers CSV ──────────────────────────────────────────────────────────────

function toCSV(headers, rows) {
  const lines = [headers.join(',')]
  rows.forEach(row =>
    lines.push(headers.map(h => String(row[h] ?? '')).join(','))
  )
  return lines.join('\n')
}

function isoToDate(iso) {
  return iso ? iso.split('T')[0] : ''
}

function weekCount(sessions) {
  if (sessions.length === 0) return 4
  const earliest  = new Date(sessions[0].startedAt)
  const weeksAgo  = Math.ceil((Date.now() - earliest) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(weeksAgo + 1, 4)
}

// ─── Generación de los 3 CSVs ─────────────────────────────────────────────────

function buildPesoCSV(weightLogs) {
  return toCSV(['fecha', 'peso_kg'],
    weightLogs.map(log => ({ fecha: isoToDate(log.recordedAt), peso_kg: log.weightKg }))
  )
}

function buildEntrenamientosCSV(sessions) {
  const rows = []
  sessions.forEach(session => {
    const fecha      = isoToDate(session.startedAt)
    const tipo       = session.sessionType ?? 'gym'
    session.exercises.forEach(ex => {
      ex.sets.forEach((set, i) => {
        const ejercicioMeta = resolverEjercicio(ex.exerciseId)
        rows.push({
          fecha,
          dia:              session.dayIndex ?? '',
          ejercicio_id:     ex.exerciseId,
          ejercicio_nombre: ejercicioMeta?.nombre ?? ex.exerciseId,
          serie_numero:     i + 1,
          peso_kg:          set.weightKg,
          repeticiones:     set.reps,
          tipo_sesion:      tipo,
        })
      })
    })
  })
  return toCSV(
    ['fecha', 'dia', 'ejercicio_id', 'ejercicio_nombre', 'serie_numero', 'peso_kg', 'repeticiones', 'tipo_sesion'],
    rows
  )
}

function buildConsistenciaCSV(sessions, weightLogs) {
  const count = weekCount(sessions)
  const weeks = getWeeklyScores(sessions, weightLogs, count)
  return toCSV(
    ['semana_inicio', 'semana_fin', 'score', 'entrenamientos_completados', 'peso_registrado_al_dia'],
    weeks.map(week => {
      const end = new Date(week.weekStart)
      end.setDate(end.getDate() + 6)
      return {
        semana_inicio:            week.weekStart.split('T')[0],
        semana_fin:               end.toISOString().split('T')[0],
        score:                    week.score,
        entrenamientos_completados: week.trainings,
        peso_registrado_al_dia:   week.weightBonus,
      }
    })
  )
}

// ─── Descarga principal ───────────────────────────────────────────────────────

export async function generateAndDownloadBackup() {
  const [weightLogs, sessions] = await Promise.all([getAllWeightLogs(), getAllSessions()])

  const zipped = zipSync({
    'peso_corporal.csv':        strToU8(buildPesoCSV(weightLogs)),
    'entrenamientos.csv':       strToU8(buildEntrenamientosCSV(sessions)),
    'consistencia_semanal.csv': strToU8(buildConsistenciaCSV(sessions, weightLogs)),
  })

  const today   = new Date().toISOString().split('T')[0]
  const zipName = `fittracker_backup_${today}.zip`

  const blob = new Blob([zipped], { type: 'application/zip' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  markBackupDownloaded()

  return {
    zipName,
    pesoCount:    weightLogs.length,
    sessionCount: sessions.length,
  }
}
