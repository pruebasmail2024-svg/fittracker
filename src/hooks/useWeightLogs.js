import { useState, useEffect, useCallback } from 'react'
import { getAllWeightLogs, addWeightLog } from '../services/weightService'
import { useAuth } from '../contexts/AuthContext'

export function useWeightLogs() {
  const { user }                    = useAuth()
  const [logs, setLogs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const all = await getAllWeightLogs(user.id)
      setLogs(all)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = useCallback(async ({ weightKg, recordedAt }) => {
    await addWeightLog(user.id, { weightKg, recordedAt })
    await fetchLogs()
  }, [user, fetchLogs])

  return { logs, loading, error, addLog }
}
