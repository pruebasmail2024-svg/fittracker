import { useState, useEffect } from 'react'
import { getAllSessions }    from '../services/workoutService'
import { getAllWeightLogs }  from '../services/weightService'
import { getWeeklyScores }  from '../services/consistencyService'

export function useConsistencyScore() {
  const [weeks, setWeeks]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllSessions(), getAllWeightLogs()]).then(([sessions, logs]) => {
      setWeeks(getWeeklyScores(sessions, logs))
      setLoading(false)
    })
  }, [])

  const current = weeks.at(-1) ?? { score: 0, trainings: 0, trainingPts: 0, weightBonus: 0 }

  return { weeks, loading, current }
}
