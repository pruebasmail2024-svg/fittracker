import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/workoutService'
import { formatDateChart } from '../utils/date'

export function useExerciseHistory(exerciseId) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseId) { setData([]); return }
    setLoading(true)
    getAllSessions().then(sessions => {
      const result = sessions
        .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
        .map(s => {
          const ex = s.exercises.find(e => e.exerciseId === exerciseId)
          const maxWeight  = Math.max(...ex.sets.map(set => Number(set.weightKg)))
          const totalReps  = ex.sets.reduce((acc, set) => acc + Number(set.reps), 0)
          const volume     = ex.sets.reduce((acc, set) =>
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
  }, [exerciseId])

  return { data, loading }
}
