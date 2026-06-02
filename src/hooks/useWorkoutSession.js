import { useState, useCallback, useEffect } from 'react'
import { WORKOUT_PLAN } from '../data/workoutPlan'
import { saveWorkoutSession } from '../services/workoutService'
import { getLastSessionByDay } from '../services/workoutService'
import { useRestTimer } from './useRestTimer'

/**
 * Aplana los pares de un día en una lista plana de ejercicios,
 * manteniendo la referencia al par para mostrarlo en la UI.
 */
function flattenExercises(day) {
  return day.pairs.flatMap(pair =>
    pair.exercises.map(ex => ({ ...ex, pairLabel: pair.exercises.map(e => e.name).join(' + ') }))
  )
}

export function useWorkoutSession() {
  // phase: 'idle' | 'exercising' | 'resting' | 'done'
  const [phase, setPhase]             = useState('idle')
  const [dayIndex, setDayIndex]       = useState(null)
  const [exercises, setExercises]     = useState([])
  const [exIndex, setExIndex]         = useState(0)
  const [setIndex, setSetIndex]       = useState(0)
  const [startedAt, setStartedAt]     = useState(null)
  const [loggedData, setLoggedData]   = useState({})   // exerciseId → [{ weightKg, reps }]
  const [lastSession, setLastSession] = useState(null) // sesión anterior del mismo día

  const timer = useRestTimer(45)

  const currentExercise = exercises[exIndex] ?? null
  const totalSets       = currentExercise?.sets ?? 0

  // Arranca una sesión: carga ejercicios y la última sesión del mismo día
  const startDay = useCallback(async (idx) => {
    const day   = WORKOUT_PLAN[idx]
    const flat  = flattenExercises(day)
    const prev  = await getLastSessionByDay(idx)
    setDayIndex(idx)
    setExercises(flat)
    setExIndex(0)
    setSetIndex(0)
    setLoggedData({})
    setLastSession(prev)
    setStartedAt(new Date().toISOString())
    setPhase('exercising')
  }, [])

  // Registra la serie actual y avanza al siguiente estado
  const logSet = useCallback((weightKg, reps) => {
    const exId = currentExercise.id

    // Acumula la serie en loggedData
    setLoggedData(prev => ({
      ...prev,
      [exId]: [...(prev[exId] ?? []), { weightKg: Number(weightKg), reps: Number(reps) }],
    }))

    const isLastSet      = setIndex >= totalSets - 1
    const isLastExercise = exIndex >= exercises.length - 1

    if (isLastSet && isLastExercise) {
      // Sesión terminada — guardamos después del state flush via useEffect
      setPhase('done')
      return
    }

    // Hay más trabajo → descanso
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

  // Guarda la sesión cuando phase pasa a 'done'
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
    setLastSession(null)
    setStartedAt(null)
  }, [timer])

  // Referencia de la sesión anterior para el ejercicio actual
  const prevExerciseData = lastSession?.exercises?.find(
    e => e.exerciseId === currentExercise?.id
  ) ?? null

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
