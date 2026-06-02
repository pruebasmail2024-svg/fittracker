import { useEffect, useRef, useState } from 'react'
import { useLocation }                  from 'react-router-dom'
import { useWorkoutSession }            from '../hooks/useWorkoutSession'
import { useStagnationAlerts }          from '../hooks/useStagnationAlerts'
import { formatDuration }               from '../utils/format'
import DayPicker                        from '../components/DayPicker'
import ExerciseCard                     from '../components/ExerciseCard'
import SetLogger                        from '../components/SetLogger'
import RestTimer                        from '../components/RestTimer'
import SessionSummary                   from '../components/SessionSummary'
import StagnationAlert                  from '../components/StagnationAlert'
import ExerciseInlineChart              from '../components/ExerciseInlineChart'

export default function Entrenar() {
  const location    = useLocation()
  const session     = useWorkoutSession()
  const { alerts }  = useStagnationAlerts()
  const autoStarted = useRef(false)

  // Cronómetro ascendente visible durante la sesión
  const [elapsed, setElapsed] = useState(0)

  const {
    phase, dayIndex, currentExercise, setIndex, totalSets,
    timer, loggedData, prevExerciseData, startedAt, startDay, logSet, reset,
  } = session

  // Auto-arrancar si venimos del Home con día pre-seleccionado
  useEffect(() => {
    const autoStartDay = location.state?.autoStartDay
    if (typeof autoStartDay === 'number' && !autoStarted.current && phase === 'idle') {
      autoStarted.current = true
      startDay(autoStartDay)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar cronómetro cada segundo mientras hay sesión activa
  useEffect(() => {
    if (!startedAt || phase === 'idle' || phase === 'done') {
      setElapsed(0)
      return
    }
    const startMs = new Date(startedAt).getTime()
    setElapsed(Math.floor((Date.now() - startMs) / 1000))
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt, phase])

  if (phase === 'idle') {
    return <DayPicker onSelectDay={startDay} alerts={alerts} />
  }

  if (phase === 'done') {
    return (
      <SessionSummary
        dayIndex={dayIndex}
        loggedData={loggedData}
        startedAt={startedAt}
        onFinish={reset}
      />
    )
  }

  if (phase === 'resting') {
    return (
      <div className="flex flex-col gap-4">
        {/* Cronómetro de sesión visible también en el descanso */}
        <div className="flex justify-end">
          <span className="text-xs text-slate-600 font-mono tabular-nums">
            ⏱ {formatDuration(elapsed)}
          </span>
        </div>
        <RestTimer timeLeft={timer.timeLeft} onSkip={timer.skip} />
      </div>
    )
  }

  // phase === 'exercising'
  return (
    <div className="flex flex-col gap-5">
      {/* Fila superior: botón salir + cronómetro */}
      <div className="flex items-center justify-between">
        <button
          onClick={reset}
          className="text-xs text-slate-600 active:text-slate-400 py-2"
        >
          ← Abandonar
        </button>
        <span className="text-sm font-mono tabular-nums text-slate-400 font-semibold">
          ⏱ {formatDuration(elapsed)}
        </span>
      </div>

      <ExerciseCard
        exercise={currentExercise}
        setIndex={setIndex}
        totalSets={totalSets}
      />

      {alerts[currentExercise?.id] && (
        <StagnationAlert exerciseName={currentExercise.name} />
      )}

      <SetLogger
        exercise={currentExercise}
        setIndex={setIndex}
        prevExerciseData={prevExerciseData}
        onLog={logSet}
      />

      <ExerciseInlineChart exerciseId={currentExercise?.id} />
    </div>
  )
}
