import { useWorkoutSession }   from '../hooks/useWorkoutSession'
import { useStagnationAlerts } from '../hooks/useStagnationAlerts'
import DayPicker               from '../components/DayPicker'
import ExerciseCard            from '../components/ExerciseCard'
import SetLogger               from '../components/SetLogger'
import RestTimer               from '../components/RestTimer'
import SessionSummary          from '../components/SessionSummary'
import StagnationAlert         from '../components/StagnationAlert'
import ExerciseInlineChart     from '../components/ExerciseInlineChart'

export default function Entrenar() {
  const session = useWorkoutSession()
  const { alerts } = useStagnationAlerts()

  const {
    phase, dayIndex, currentExercise, setIndex, totalSets,
    timer, loggedData, prevExerciseData, startDay, logSet, reset,
  } = session

  if (phase === 'idle') {
    return <DayPicker onSelectDay={startDay} alerts={alerts} />
  }

  if (phase === 'done') {
    return (
      <SessionSummary dayIndex={dayIndex} loggedData={loggedData} onFinish={reset} />
    )
  }

  if (phase === 'resting') {
    return <RestTimer timeLeft={timer.timeLeft} onSkip={timer.skip} />
  }

  // phase === 'exercising'
  return (
    <div className="flex flex-col gap-5">
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
