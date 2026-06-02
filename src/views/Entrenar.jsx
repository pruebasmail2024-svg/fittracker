import { useWorkoutSession } from '../hooks/useWorkoutSession'
import DayPicker      from '../components/DayPicker'
import ExerciseCard   from '../components/ExerciseCard'
import SetLogger      from '../components/SetLogger'
import RestTimer      from '../components/RestTimer'
import SessionSummary from '../components/SessionSummary'

export default function Entrenar() {
  const session = useWorkoutSession()
  const { phase, dayIndex, currentExercise, setIndex, totalSets,
          timer, loggedData, prevExerciseData, startDay, logSet, reset } = session

  if (phase === 'idle') {
    return <DayPicker onSelectDay={startDay} />
  }

  if (phase === 'done') {
    return (
      <SessionSummary
        dayIndex={dayIndex}
        loggedData={loggedData}
        onFinish={reset}
      />
    )
  }

  if (phase === 'resting') {
    return (
      <RestTimer
        timeLeft={timer.timeLeft}
        onSkip={timer.skip}
      />
    )
  }

  // phase === 'exercising'
  return (
    <div className="flex flex-col gap-5">
      {/* Botón de salida discreta */}
      <button
        onClick={reset}
        className="self-start text-xs text-slate-600 active:text-slate-400"
      >
        ← Abandonar sesión
      </button>

      <ExerciseCard
        exercise={currentExercise}
        setIndex={setIndex}
        totalSets={totalSets}
      />

      <SetLogger
        exercise={currentExercise}
        setIndex={setIndex}
        prevExerciseData={prevExerciseData}
        onLog={logSet}
      />
    </div>
  )
}
