import { useState } from 'react'

export default function Onboarding({ onComplete }) {
  const [form, setForm] = useState({ age: '', weightKg: '', heightCm: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validate() {
    const { age, weightKg, heightCm } = form
    if (!age || !weightKg || !heightCm) return 'Completá todos los campos.'
    if (age < 10 || age > 120)          return 'Ingresá una edad válida.'
    if (weightKg < 20 || weightKg > 300) return 'Ingresá un peso válido (kg).'
    if (heightCm < 100 || heightCm > 250) return 'Ingresá una altura válida (cm).'
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    onComplete(form)
  }

  return (
    <div className="flex flex-col justify-center min-h-full gap-8 px-2 py-8">
      {/* Encabezado */}
      <div className="text-center">
        <span className="text-5xl">👋</span>
        <h1 className="mt-3 text-2xl font-bold text-slate-100">
          Bienvenido a Training &amp; Longevity
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Contanos un poco sobre vos para personalizar tu experiencia.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          label="Edad"
          name="age"
          value={form.age}
          onChange={handleChange}
          placeholder="ej. 32"
          unit="años"
          min={10}
          max={120}
        />
        <Field
          label="Peso actual"
          name="weightKg"
          value={form.weightKg}
          onChange={handleChange}
          placeholder="ej. 80"
          unit="kg"
          min={20}
          max={300}
          step="0.1"
        />
        <Field
          label="Altura"
          name="heightCm"
          value={form.heightCm}
          onChange={handleChange}
          placeholder="ej. 178"
          unit="cm"
          min={100}
          max={250}
        />

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-brand-500 py-3.5 font-semibold text-white
                     active:bg-brand-600 transition-colors"
        >
          Comenzar
        </button>
      </form>

      <p className="text-center text-xs text-slate-600">
        Tus datos se guardan solo en este dispositivo.
      </p>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, unit, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3
                      border border-slate-700 focus-within:border-brand-500 transition-colors">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-600
                     focus:outline-none text-lg"
          {...inputProps}
        />
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
    </div>
  )
}
