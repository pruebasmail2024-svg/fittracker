import { useState, useEffect } from 'react'
import { getAllSessions }    from '../services/workoutService'
import { getAllWeightLogs }  from '../services/weightService'
import { getWeeklyScores }  from '../services/consistencyService'
import { useAuth }          from '../contexts/AuthContext'

export function useConsistencyScore() {
  const { user }              = useAuth()
  const [weeks, setWeeks]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getAllSessions(user.id), getAllWeightLogs(user.id)]).then(([sessions, logs]) => {
      setWeeks(getWeeklyScores(sessions, logs))
      setLoading(false)
    })
  }, [user])

  const current = weeks.at(-1) ?? { score: 0, trainings: 0, trainingPts: 0, weightBonus: 0 }

  return { weeks, loading, current }
}
