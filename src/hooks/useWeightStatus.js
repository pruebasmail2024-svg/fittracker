import { useWeightLogs } from './useWeightLogs'

/**
 * Devuelve el estado del registro quincenal de peso:
 * - 'ok'      → ≤ 10 días desde el último registro
 * - 'warning' → entre 10 y 15 días (vence pronto)
 * - 'overdue' → más de 15 días sin registrar
 */
export function useWeightStatus() {
  const { logs, loading, addLog } = useWeightLogs()

  // logs viene ordenado ASC, el último es el más reciente
  const lastLog = logs.at(-1) ?? null

  const daysSince = lastLog
    ? (Date.now() - new Date(lastLog.recordedAt)) / (1000 * 60 * 60 * 24)
    : Infinity

  const daysLeft = Math.ceil(15 - daysSince)
  const daysLate = Math.floor(daysSince - 15)

  let status, label, color

  if (daysSince > 15) {
    status = 'overdue'
    label  = `Atrasado ${daysLate} día${daysLate !== 1 ? 's' : ''}`
    color  = 'red'
  } else if (daysSince > 10) {
    status = 'warning'
    label  = `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`
    color  = 'yellow'
  } else {
    status = 'ok'
    label  = 'Al día ✓'
    color  = 'green'
  }

  return { lastLog, daysSince, status, label, color, loading, addLog, logs }
}
