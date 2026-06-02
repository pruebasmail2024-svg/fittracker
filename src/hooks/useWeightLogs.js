import { useState, useEffect, useCallback } from 'react'
import { getAllWeightLogs, addWeightLog } from '../services/weightService'

export function useWeightLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const all = await getAllWeightLogs()
    setLogs(all)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = useCallback(async ({ weightKg, recordedAt }) => {
    await addWeightLog({ weightKg, recordedAt })
    await fetchLogs() // refresca la lista después de agregar
  }, [fetchLogs])

  return { logs, loading, addLog }
}
