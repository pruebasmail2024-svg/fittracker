import { formatDateChart } from '../utils/date'

// ─── Helpers de semana (lunes → domingo) ─────────────────────────────────────

function getWeekStart(date) {
  const d   = new Date(date)
  const day = d.getDay()                   // 0=Dom, 1=Lun…
  const diff = day === 0 ? -6 : 1 - day   // retrocede hasta el lunes
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekEnd(weekStart) {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

// ─── Cálculo de score para una semana ────────────────────────────────────────

function calcWeekScore(sessions, weightLogs, weekStart, isCurrentWeek) {
  const weekEnd = getWeekEnd(weekStart)

  // Sesiones completadas en esta semana
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.completedAt || s.startedAt)
    return d >= weekStart && d <= weekEnd
  })
  const trainings    = Math.min(weekSessions.length, 3)
  const trainingPts  = trainings * 33

  // Bonus de peso: ¿había un registro en los últimos 15 días al cierre de la semana?
  const cutoff = new Date(weekEnd)
  cutoff.setDate(cutoff.getDate() - 15)
  const weightBonus = weightLogs.some(log => {
    const d = new Date(log.recordedAt)
    return d >= cutoff && d <= weekEnd
  }) ? 1 : 0

  return {
    score:       trainingPts + weightBonus,
    trainings,
    trainingPts,
    weightBonus,
    label: isCurrentWeek
      ? 'Esta sem.'
      : formatDateChart(weekStart.toISOString()),
    weekStart: weekStart.toISOString(),
  }
}

// ─── Score de las últimas N semanas ──────────────────────────────────────────

/**
 * Devuelve un array con el score de cada una de las últimas `count` semanas,
 * ordenado del más antiguo al más reciente (el último = semana actual).
 *
 * TODO (futuro): cuando los módulos de Nutrición y Sueño estén activos,
 * este score deberá promediar también la adherencia a esas metas diarias.
 * Propuesta: nutrición +0 a 33 pts · sueño +0 a 33 pts → dividir entre 3 módulos.
 */
export function getWeeklyScores(sessions, weightLogs, count = 4) {
  const currentWeekStart = getWeekStart(new Date())
  const result = []

  for (let i = count - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - i * 7)
    result.push(calcWeekScore(sessions, weightLogs, weekStart, i === 0))
  }

  return result
}
