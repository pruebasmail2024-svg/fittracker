import { useState, useEffect } from 'react'

export default function WeightLogModal({ isOpen, onClose, onSave, title, subtitle }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  // Limpia el campo cada vez que el modal se abre
  useEffect(() => {
    if (isOpen) { setValue(''); setError('') }
  }, [isOpen])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    const num = parseFloat(value)
    if (isNaN(num) || num < 30 || num > 250) {
      setError('Ingresá un peso válido entre 30 y 250 kg.')
      return
    }
    onSave(num)
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — se detiene el click para no cerrar al tocar adentro */}
      <div
        className="w-full max-w-lg rounded-t-3xl bg-slate-900 border-t border-slate-700
                   px-5 py-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle visual */}
        <div className="mx-auto w-10 h-1 rounded-full bg-slate-700" />

        {/* Encabezado */}
        <div>
          <h2 className="text-lg font-bold text-slate-100">
            {title ?? '⚖️ Registrar peso'}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                       active:bg-brand-600 transition-colors"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl py-3 text-sm text-slate-500
                       active:text-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}
