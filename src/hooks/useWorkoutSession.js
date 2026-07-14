import { useState, useCallback, useEffect } from 'react'
import { getDiaParaSesion, idCanonico } from '../services/rutinaService'
import { saveWorkoutSession, getAllSessions } from '../services/workoutService'
import { useRestTimer } from './useRestTimer'
import { useAuth } from '../contexts/AuthContext'

async function buildLastDataMap(userId, exercises) {
  const allSessions = await getAllSessions(userId)
  const map = {}
  exercises.forEach(ex => {
    const objetivo = idCanonico(ex.id)
    const last = [...allSessions]
      .filter(s => s.exercises?.some(e => idCanonico(e.exerciseId) === objetivo))
      .at(-1)
    if (last) map[ex.id] = last.exercises.find(e => idCanonico(e.exerciseId) === objetivo)
  })
  return map
}

export function useWorkoutSession() {
  const { user }                              = useAuth()
  const [phase, setPhase]                     = useState('idle')
  const [dayIndex, setDayIndex]               = useState(null)
  const [exercises, setExercises]             = useState([])
  const [exIndex, setExIndex]                 = useState(0)
  const [setIndex, setSetIndex]               = useState(0)
  const [startedAt, setStartedAt]             = useState(null)
  const [loggedData, setLoggedData]           = useState({})
  const [lastDataByExercise, setLastDataByEx] = useState({})

  const timer = useRestTimer(45)

  const currentExercise = exercises[exIndex] ?? null
  const totalSets       = currentExercise?.sets ?? 0

  const startDay = useCallback(async (idx) => {
    const flat     = await getDiaParaSesion(user.id, idx)
    const lastData = await buildLastDataMap(user.id, flat)

    setDayIndex(idx)
    setExercises(flat)
    setExIndex(0)
    setSetIndex(0)
    setLoggedData({})
    setLastDataByEx(lastData)
    setStartedAt(new Date().toISOString())
    setPhase('exercising')
  }, [user])

  const logSet = useCallback((weightKg, reps) => {
    const exId = currentExercise.id

    setLoggedData(prev => ({
      ...prev,
      [exId]: [...(prev[exId] ?? []), { weightKg: Number(weightKg), reps: Number(reps) }],
    }))

    const isLastSet      = setIndex >= totalSets - 1
    const isLastExercise = exIndex >= exercises.length - 1

    if (isLastSet && isLastExercise) {
      setPhase('done')
      return
    }

    setPhase('resting')
    timer.start(45, () => {
      if (isLastSet) { setExIndex(i => i + 1); setSetIndex(0) }
      else           { setSetIndex(i => i + 1) }
      setPhase('exercising')
    })
  }, [currentExercise, setIndex, totalSets, exIndex, exercises.length, timer])

  useEffect(() => {
    if (phase !== 'done') return
    const durationSeconds = startedAt
      ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
      : 0
    const exercisesPayload = Object.entries(loggedData).map(([exerciseId, sets]) => ({
      exerciseId, sets,
    }))
    saveWorkoutSession(user.id, { dayIndex, startedAt, exercises: exercisesPayload, durationSeconds })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    timer.skip()
    setPhase('idle')
    setDayIndex(null)
    setExercises([])
    setExIndex(0)
    setSetIndex(0)
    setLoggedData({})
    setLastDataByEx({})
    setStartedAt(null)
  }, [timer])

  const prevExerciseData = lastDataByExercise[currentExercise?.id] ?? null

  return {
    phase, dayIndex, currentExercise, setIndex, totalSets,
    timer, loggedData, prevExerciseData, startedAt,
    startDay, logSet, reset,
  }
}
