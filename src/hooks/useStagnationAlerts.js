import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/workoutService'
import { detectStagnation } from '../services/analyticsService'
import { getRutina } from '../services/rutinaService'
import { useAuth } from '../contexts/AuthContext'

export function useStagnationAlerts() {
  const { user }                = useAuth()
  const [alerts, setAlerts]     = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getAllSessions(user.id), getRutina(user.id)]).then(([sessions, rutina]) => {
      const result = {}
      rutina.forEach(day => {
        day.slots.forEach(slot => {
          result[slot.exerciseId] = detectStagnation(slot.exerciseId, day.dayIndex, sessions)
        })
      })
      setAlerts(result)
      setLoading(false)
    })
  }, [user])

  return { alerts, loading }
}
