import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/workoutService'
import { detectStagnation } from '../services/analyticsService'
import { WORKOUT_PLAN } from '../data/workoutPlan'

/**
 * Devuelve un mapa { exerciseId: boolean } indicando qué ejercicios
 * tienen estancamiento en las últimas 3 sesiones de su día correspondiente.
 */
export function useStagnationAlerts() {
  const [alerts, setAlerts]   = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSessions().then(sessions => {
      const result = {}
      WORKOUT_PLAN.forEach(day => {
        day.pairs.forEach(pair => {
          pair.exercises.forEach(ex => {
            result[ex.id] = detectStagnation(ex.id, day.dayIndex, sessions)
          })
        })
      })
      setAlerts(result)
      setLoading(false)
    })
  }, [])

  return { alerts, loading }
}
