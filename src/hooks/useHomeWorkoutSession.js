import { useState, useCallback } from 'react'
import { getAllSessions, saveWorkoutSession } from '../services/workoutService'
import { filtrarEjercicios } from './useEjerciciosCatalogo'
import { useAuth } from '../contexts/AuthContext'

let _instanceCounter = 0

async function loadPrevData(userId) {
  const all     = await getAllSessions(userId)
  const casaEjs = filtrarEjercicios({ lugar: 'casa' })
  const map = {}
  casaEjs.forEach(ex => {
    const last = [...all]
      .filter(s => s.exercises?.some(e => e.exerciseId === ex.id))
      .at(-1)
    if (last) map[ex.id] = last.exercises.find(e => e.exerciseId === ex.id)
  })
  return map
}

export function useHomeWorkoutSession() {
  const { user }                              = useAuth()
  const [phase, setPhase]                     = useState('idle')
  const [sessionType, setSessionType]         = useState(null)
  const [dayIndex, setDayIndex]               = useState(null)
  const [startedAt, setStartedAt]             = useState(null)
  const [blocks, setBlocks]                   = useState([])
  const [prevData, setPrevData]               = useState({})

  const start = useCallback(async (type, gymDayIndex = null) => {
    const prev = await loadPrevData(user.id)
    setSessionType(type)
    setDayIndex(gymDayIndex)
    setStartedAt(new Date().toISOString())
    setBlocks([])
    setPrevData(prev)
    setPhase('active')
  }, [user])

  const addExercise = useCallback((exerciseId) => {
    const instanceId = `${exerciseId}_${++_instanceCounter}`
    setBlocks(prev => [...prev, { instanceId, exerciseId, sets: [] }])
  }, [])

  const addSet = useCallback((instanceId, reps, weightKg) => {
    setBlocks(prev => prev.map(b =>
      b.instanceId === instanceId
        ? { ...b, sets: [...b.sets, { reps: Number(reps), weightKg: weightKg != null ? Number(weightKg) : 0 }] }
        : b
    ))
  }, [])

  const updateSet = useCallback((instanceId, setIdx, field, value) => {
    setBlocks(prev => prev.map(b => {
      if (b.instanceId !== instanceId) return b
      const sets = b.sets.map((s, i) => i === setIdx ? { ...s, [field]: Number(value) } : s)
      return { ...b, sets }
    }))
  }, [])

  const removeBlock = useCallback((instanceId) => {
    setBlocks(prev => prev.filter(b => b.instanceId !== instanceId))
  }, [])

  const save = useCallback(async () => {
    const durationSeconds = startedAt
      ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
      : 0
    const exercises = blocks
      .filter(b => b.sets.length > 0)
      .map(b => ({ exerciseId: b.exerciseId, sets: b.sets }))

    await saveWorkoutSession(user.id, {
      dayIndex, startedAt, exercises, durationSeconds, sessionType,
    })
    setPhase('done')
  }, [user, blocks, dayIndex, startedAt, sessionType])

  const reset = useCallback(() => {
    setPhase('idle')
    setSessionType(null)
    setDayIndex(null)
    setStartedAt(null)
    setBlocks([])
    setPrevData({})
  }, [])

  return {
    phase, sessionType, startedAt, blocks, prevData,
    start, addExercise, addSet, updateSet, removeBlock, save, reset,
  }
}
