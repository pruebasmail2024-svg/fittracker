import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useHomeWorkoutSession }   from '../hooks/useHomeWorkoutSession'
import { getHomeExerciseById }     from '../data/homeExercises'
import { WORKOUT_PLAN }            from '../data/workoutPlan'
import { formatDuration, formatVolume } from '../utils/format'
import HomeExercisePicker          from '../components/HomeExercisePicker'
import HomeExerciseCard            from '../components/HomeExerciseCard'

// ─── Pantalla de selección de modo ───────────────────────────────────────────

function ModeSelector({ nextDayIndex, onSelect }) {
  const [confirming, setConfirming] = useState(false)
  const day = WORKOUT_PLAN[nextDayIndex]

  if (confirming) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <div className="text-center">
          <span className="text-5xl">🏋️</span>
          <h2 className="text-xl font-bold text-slate-100 mt-3">¿Confirmar reemplazo?</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Esta sesión contará como el <span className="text-slate-200 font-semibold">{day?.label}</span> del gym
            y sumará al score de consistencia semanal.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect('home_replacement', nextDayIndex)}
            className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                       active:bg-brand-600 transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="w-full rounded-2xl border border-slate-600 py-3 text-sm text-slate-400
                       active:bg-slate-800 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">🏠 Entrenar en Casa</h1>
        <p className="text-sm text-slate-400 mt-2">¿Cómo contás esta sesión?</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => setConfirming(true)}
          className="w-full text-left rounded-2xl bg-slate-800 border border-slate-700
                     px-5 py-5 active:scale-95 transition-transform"
        >
          <p className="font-bold text-slate-100 text-base">🏋️ Reemplaza mi sesión de gym</p>
          <p className="text-xs text-slate-400 mt-1">
            Cuenta como el {day?.label} del gym. Suma al score de consistencia semanal.
          </p>
        </button>

        <button
          onClick={() => onSelect('home_extra', null)}
          className="w-full text-left rounded-2xl bg-slate-800 border border-slate-700
                     px-5 py-5 active:scale-95 transition-transform"
        >
          <p className="font-bold text-slate-100 text-base">➕ Es un complemento extra</p>
          <p className="text-xs text-slate-400 mt-1">
            Entrenamiento adicional. No afecta el score del gym.
          </p>
        </button>
      </div>
    </div>
  )
}

// ─── Pantalla de resumen final ────────────────────────────────────────────────

function DoneSummary({ sessionType, blocks, startedAt, onFinish }) {
  const totalSets = blocks.reduce((acc, b) => acc + b.sets.length, 0)
  const totalVolume = blocks.flatMap(b => b.sets)
    .reduce((acc, s) => acc + s.weightKg * s.reps, 0)
  const durationSeconds = startedAt
    ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
    : 0

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold text-slate-100 mt-3">¡Sesión completada!</h2>
        <p className="text-slate-400 text-sm mt-1">
          {sessionType === 'home_replacement' ? '🏠 Reemplazó sesión de gym' : '🏠 Complemento extra'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Series</p>
          <p className="text-lg font-bold text-slate-100">{totalSets}</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Volumen</p>
          <p className="text-lg font-bold text-brand-400">{formatVolume(totalVolume)}</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-center">
          <p className="text-xs text-slate-500">Duración</p>
          <p className="text-lg font-bold text-slate-100">{formatDuration(durationSeconds)}</p>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                   active:bg-brand-600 transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function HomeWorkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const nextDayIndex = location.state?.nextDayIndex ?? 0

  const {
    phase, sessionType, startedAt, blocks, prevData,
    start, addExercise, addSet, updateSet, removeBlock, save, reset,
  } = useHomeWorkoutSession()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [elapsed, setElapsed]       = useState(0)

  // Cronómetro ascendente
  useEffect(() => {
    if (!startedAt || phase !== 'active') { setElapsed(0); return }
    const startMs = new Date(startedAt).getTime()
    setElapsed(Math.floor((Date.now() - startMs) / 1000))
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt, phase])

  function handleFinish() {
    reset()
    navigate('/')
  }

  // ── Selección de modo ──
  if (phase === 'idle') {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-slate-600 active:text-slate-400 py-2 mb-2"
        >
          ← Volver
        </button>
        <ModeSelector
          nextDayIndex={nextDayIndex}
          onSelect={(type, dayIdx) => start(type, dayIdx)}
        />
      </div>
    )
  }

  // ── Sesión completada ──
  if (phase === 'done') {
    return <DoneSummary sessionType={sessionType} blocks={blocks} startedAt={startedAt} onFinish={handleFinish} />
  }

  // ── Sesión activa ──
  const hasContent = blocks.some(b => b.sets.length > 0)

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button onClick={handleFinish} className="text-xs text-slate-600 active:text-slate-400 py-2">
          ← Abandonar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {sessionType === 'home_replacement' ? '🏠 Reemplaza gym' : '🏠 Complemento'}
          </span>
          <span className="text-sm font-mono tabular-nums text-slate-400 font-semibold">
            ⏱ {formatDuration(elapsed)}
          </span>
        </div>
      </div>

      {/* Ejercicios agregados */}
      {blocks.length === 0 && (
        <div className="text-center py-10 text-slate-600">
          <p className="text-4xl mb-2">🏠</p>
          <p className="text-sm">Agregá ejercicios para empezar</p>
        </div>
      )}

      {blocks.map(block => {
        const exercise = getHomeExerciseById(block.exerciseId)
        if (!exercise) return null
        return (
          <HomeExerciseCard
            key={block.instanceId}
            block={block}
            exercise={exercise}
            prevEntry={prevData[block.exerciseId] ?? null}
            onAddSet={addSet}
            onUpdateSet={updateSet}
            onRemove={removeBlock}
          />
        )
      })}

      {/* Botón agregar ejercicio */}
      <button
        onClick={() => setPickerOpen(true)}
        className="w-full rounded-2xl border border-dashed border-slate-600 py-4
                   text-sm font-medium text-slate-400 active:bg-slate-800 transition-colors"
      >
        + Agregar ejercicio
      </button>

      {/* Guardar sesión */}
      {hasContent && (
        <button
          onClick={save}
          className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                     active:bg-brand-600 transition-colors"
        >
          Guardar sesión
        </button>
      )}

      <HomeExercisePicker
        isOpen={pickerOpen}
        onSelect={addExercise}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}
