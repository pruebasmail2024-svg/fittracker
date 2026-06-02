import { useMemo } from 'react'
import { useWeightLogs } from './useWeightLogs'
import { useProfile } from './useProfile'
import { generateWeightProjection } from '../services/analyticsService'
import { formatDateChart } from '../utils/date'

export function useBodyWeightChart() {
  const { logs, loading: logsLoading }       = useWeightLogs()
  const { profile, loading: profileLoading } = useProfile()

  const chartData = useMemo(() => {
    if (!profile) return []

    const projection = generateWeightProjection(profile.createdAt, profile.weightKg)

    // Mapa ordenado por fecha (YYYY-MM-DD como clave para comparar)
    const map = new Map()
    projection.forEach(p => {
      map.set(p.date, {
        dateLabel: formatDateChart(p.date + 'T12:00:00'),
        projected: p.projected,
      })
    })

    // Superponer datos reales
    logs.forEach(log => {
      const key      = log.recordedAt.split('T')[0]
      const existing = map.get(key) ?? { dateLabel: formatDateChart(log.recordedAt) }
      map.set(key, { ...existing, real: log.weightKg })
    })

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
  }, [profile, logs])

  return {
    chartData,
    loading: logsLoading || profileLoading,
    profile,
  }
}
