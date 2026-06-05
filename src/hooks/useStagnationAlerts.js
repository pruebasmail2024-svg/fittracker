import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/workoutService'
import { detectStagnation } from '../services/analyticsService'
import { getRutina } from '../services/rutinaService'

/**
 * Devuelve un mapa { exerciseId: boolean } indicando qué ejercicios
 * tienen estancamiento en las últimas 3 sesiones de su día correspondiente.
 * Lee la rutina activa del usuario (personalizada o default).
 */
export function useStagnationAlerts() {
  const [alerts, setAlerts]   = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSessions().then(sessions => {
      const result = {}
      const rutina = getRutina()
      rutina.forEach(day => {
        day.slots.forEach(slot => {
          result[slot.exerciseId] = detectStagnation(slot.exerciseId, day.dayIndex, sessions)
        })
      })
      setAlerts(result)
      setLoading(false)
    })
  }, [])

  return { alerts, loading }
}
