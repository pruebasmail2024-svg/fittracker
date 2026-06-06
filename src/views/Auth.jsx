import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const ERROR_MAP = {
  'Invalid login credentials':   'Email o contraseña incorrectos.',
  'User already registered':     'Ya existe una cuenta con ese email.',
  'Email not confirmed':         'Revisá tu email para confirmar la cuenta.',
  'Password should be at least': 'La contraseña debe tener al menos 6 caracteres.',
  'is invalid':                  'El email ingresado no es válido.',
  'rate limit':                  'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
}

function mapError(message) {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return val
  }
  return 'Ocurrió un error. Intentá de nuevo.'
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Auth() {
  const { signIn, signUp } = useAuth()

  const [tab, setTab]           = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  function switchTab(next) {
    setTab(next)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateEmail(email)) {
      setError('Ingresá un email válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
        // AuthContext actualiza user → App.jsx renderiza la app
      } else {
        await signUp(email, password)
        setSuccess('¡Cuenta creada! Revisá tu email para confirmarla antes de iniciar sesión.')
      }
    } catch (err) {
      setError(mapError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-slate-950 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo / nombre */}
        <div className="text-center">
          <div className="text-4xl mb-2">💪</div>
          <h1 className="text-2xl font-bold text-slate-100">FitTracker</h1>
          <p className="text-sm text-slate-500 mt-1">Tu entrenamiento, siempre con vos</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            {[
              { key: 'login',    label: 'Iniciar sesión' },
              { key: 'register', label: 'Crear cuenta'   },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === key
                    ? 'text-brand-400 border-b-2 border-brand-500 -mb-px'
                    : 'text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Email</label>
              <input
                type="email"
                inputMode="email"
                autoComplete={tab === 'login' ? 'username' : 'email'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="rounded-xl bg-slate-700 border border-slate-600 px-4 py-3
                           text-slate-100 text-sm placeholder-slate-500
                           focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl bg-slate-700 border border-slate-600 px-4 py-3 pr-12
                             text-slate-100 text-sm placeholder-slate-500
                             focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                             active:text-slate-200 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                            rounded-xl px-4 py-2 leading-relaxed">
                {error}
              </p>
            )}

            {/* Éxito (registro) */}
            {success && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20
                            rounded-xl px-4 py-2 leading-relaxed">
                {success}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white
                         active:bg-brand-600 transition-colors disabled:opacity-50 mt-1"
            >
              {loading
                ? 'Cargando…'
                : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
