import { useState, useEffect } from 'react'
import { useWeightStatus } from '../hooks/useWeightStatus'
import WeightLogModal from './WeightLogModal'

const SNOOZE_KEY = 'weightReminderSnoozedUntil'

function isSnoozed() {
  const raw = localStorage.getItem(SNOOZE_KEY)
  if (!raw) return false
  return new Date(raw) > new Date()
}

function snoozeUntilTomorrow() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  localStorage.setItem(SNOOZE_KEY, tomorrow.toISOString())
}

export default function ProactiveWeightModal() {
  const { lastLog, daysSince, loading, addLog } = useWeightStatus()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!lastLog) return           // sin registros (no debería pasar post-onboarding)
    if (isSnoozed()) return        // el usuario pidió que no moleste hoy
    if (daysSince > 15) setShow(true)
  }, [loading, lastLog, daysSince])

  function handleSave(weightKg) {
    addLog({ weightKg })
    setShow(false)
  }

  function handleSnooze() {
    snoozeUntilTomorrow()
    setShow(false)
  }

  const daysSinceRounded = Math.floor(daysSince)

  if (!show) return null

  // Usamos el modal base pero inyectamos el botón de snooze via el prop de cancelar
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-slate-900 border-t border-slate-700
                   px-5 py-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto w-10 h-1 rounded-full bg-slate-700" />

        {/* Mensaje */}
        <div className="text-center">
          <span className="text-4xl">⚖️</span>
          <h2 className="mt-3 text-lg font-bold text-slate-100">
            Actualizá tu peso
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Pasaron <span className="text-slate-200 font-semibold">{daysSinceRounded} días</span> desde
            tu último registro. Ingresalo ahora para mantener tu curva de proyección al día.
          </p>
        </div>

        {/* Campo de peso inline */}
        <WeightForm onSave={handleSave} />

        {/* Snooze */}
        <button
          onClick={handleSnooze}
          className="w-full rounded-2xl py-3 text-sm text-slate-500
                     active:text-slate-300 transition-colors"
        >
          Recordarme mañana
        </button>
      </div>
    </div>
  )
}

/** Formulario inline — sin backdrop propio, se embebe en ProactiveWeightModal */
function WeightForm({ onSave }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const num = parseFloat(value)
    if (isNaN(num) || num < 30 || num > 250) {
      setError('Ingresá un peso válido entre 30 y 250 kg.')
      return
    }
    onSave(num)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-800 border
                      border-slate-700 px-5 py-4 focus-within:border-brand-500
                      transition-colors">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="30"
          max="250"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          placeholder="ej. 80.5"
          autoFocus
          className="flex-1 bg-transparent text-3xl font-bold text-slate-100
                     placeholder-slate-600 focus:outline-none tabular-nums"
        />
        <span className="text-slate-500 text-lg">kg</span>
      </div>
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                   active:bg-brand-600 transition-colors"
      >
        Registrar ahora
      </button>
    </form>
  )
}
