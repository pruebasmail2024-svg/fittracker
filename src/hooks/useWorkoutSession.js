import { useState, useCallback, useEffect } from 'react'
import { WORKOUT_PLAN } from '../data/workoutPlan'
import { saveWorkoutSession, getAllSessions } from '../services/workoutService'
import { useRestTimer } from './useRestTimer'

function flattenExercises(day) {
  return day.pairs.flatMap(pair =>
    pair.exercises.map(ex => ({ ...ex, pairLabel: pair.exercises.map(e => e.name).join(' + ') }))
  )
}

/**
 * Para cada ejercicio del día busca la última sesión (de cualquier día)
 * que lo haya registrado. Más robusto que filtrar solo por dayIndex.
 */
async function buildLastDataMap(exercises) {
  const allSessions = await getAllSessions()
  const map = {}
  exercises.forEach(ex => {
    const last = [...allSessions]
      .filter(s => s.exercises.some(e => e.exerciseId === ex.id))
      .at(-1)
    if (last) {
      map[ex.id] = last.exercises.find(e => e.exerciseId === ex.id)
    }
  })
  return map
}

export function useWorkoutSession() {
  const [phase, setPhase]                     = useState('idle')
  const [dayIndex, setDayIndex]               = useState(null)
  const [exercises, setExercises]             = useState([])
  const [exIndex, setExIndex]                 = useState(0)
  const [setIndex, setSetIndex]               = useState(0)
  const [startedAt, setStartedAt]             = useState(null)
  const [loggedData, setLoggedData]           = useState({})
  const [lastDataByExercise, setLastDataByEx] = useState({})  // exerciseId → { sets }

  const timer = useRestTimer(45)

  const currentExercise = exercises[exIndex] ?? null
  const totalSets       = currentExercise?.sets ?? 0

  const startDay = useCallback(async (idx) => {
    const day      = WORKOUT_PLAN[idx]
    const flat     = flattenExercises(day)
    const lastData = await buildLastDataMap(flat)

    setDayIndex(idx)
    setExercises(flat)
    setExIndex(0)
    setSetIndex(0)
    setLoggedData({})
    setLastDataByEx(lastData)
    setStartedAt(new Date().toISOString())
    setPhase('exercising')
  }, [])

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
      if (isLastSet) {
        setExIndex(i => i + 1)
        setSetIndex(0)
      } else {
        setSetIndex(i => i + 1)
      }
      setPhase('exercising')
    })
  }, [currentExercise, setIndex, totalSets, exIndex, exercises.length, timer])

  useEffect(() => {
    if (phase !== 'done') return
    const exercisesPayload = Object.entries(loggedData).map(([exerciseId, sets]) => ({
      exerciseId,
      sets,
    }))
    saveWorkoutSession({ dayIndex, startedAt, exercises: exercisesPayload })
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

  // Datos de referencia para el ejercicio actual (autocomplete)
  const prevExerciseData = lastDataByExercise[currentExercise?.id] ?? null

  return {
    phase,
    dayIndex,
    currentExercise,
    setIndex,
    totalSets,
    timer,
    loggedData,
    prevExerciseData,
    startDay,
    logSet,
    reset,
  }
}
