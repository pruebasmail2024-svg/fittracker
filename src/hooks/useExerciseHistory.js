import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/workoutService'
import { idCanonico } from '../services/rutinaService'
import { formatDateChart } from '../utils/date'
import { useAuth } from '../contexts/AuthContext'

export function useExerciseHistory(exerciseId) {
  const { user }              = useAuth()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseId || !user) { setData([]); return }
    setLoading(true)
    const objetivo = idCanonico(exerciseId)
    getAllSessions(user.id).then(sessions => {
      const result = sessions
        .filter(s => s.exercises?.some(e => idCanonico(e.exerciseId) === objetivo))
        .map(s => {
          const ex        = s.exercises.find(e => idCanonico(e.exerciseId) === objetivo)
          const maxWeight = Math.max(...ex.sets.map(set => Number(set.weightKg)))
          const totalReps = ex.sets.reduce((acc, set) => acc + Number(set.reps), 0)
          const volume    = ex.sets.reduce((acc, set) =>
            acc + Number(set.weightKg) * Number(set.reps), 0)
          return {
            date:      formatDateChart(s.startedAt),
            rawDate:   s.startedAt,
            maxWeight,
            totalReps,
            volume:    Math.round(volume),
            sets:      ex.sets,
          }
        })
      setData(result)
      setLoading(false)
    })
  }, [exerciseId, user])

  return { data, loading }
}
