import { useState } from 'react'
import { migrateLegacyData, markMigrationDone } from '../services/migrationService'

export default function MigrationModal({ onDone }) {
  const [phase, setPhase]         = useState('prompt')   // prompt | migrating | done | error
  const [progress, setProgress]   = useState('')
  const [errorMsg, setErrorMsg]   = useState('')

  async function handleMigrate() {
    setPhase('migrating')
    try {
      await migrateLegacyData(msg => setProgress(msg))
      setPhase('done')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message)
      setPhase('error')
    }
  }

  function handleSkip() {
    markMigrationDone()
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6
                      flex flex-col gap-4">

        {phase === 'prompt' && (
          <>
            <div className="text-center">
              <div className="text-4xl mb-2">☁️</div>
              <h2 className="text-base font-bold text-slate-100">
                Tenés datos guardados en este dispositivo
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                ¿Querés subirlos a la nube para accederlos desde cualquier dispositivo?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleMigrate}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white
                           active:bg-brand-600 transition-colors"
              >
                Sí, subir mis datos
              </button>
              <button
                onClick={handleSkip}
                className="w-full rounded-xl border border-slate-600 py-3 text-sm text-slate-400
                           active:bg-slate-700 transition-colors"
              >
                No, empezar de cero
              </button>
            </div>
          </>
        )}

        {phase === 'migrating' && (
          <div className="text-center flex flex-col gap-3">
            <div className="text-3xl">⏳</div>
            <p className="text-sm font-semibold text-slate-100">Subiendo tus datos…</p>
            {progress && (
              <p className="text-xs text-slate-400">{progress}</p>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center flex flex-col gap-4">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-semibold text-slate-100">
              ¡Tus datos se subieron correctamente!
            </p>
            <button
              onClick={onDone}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white
                         active:bg-brand-600 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center flex flex-col gap-4">
            <div className="text-3xl">❌</div>
            <p className="text-sm font-semibold text-slate-100">Error al subir los datos</p>
            <p className="text-xs text-red-400">{errorMsg}</p>
            <div className="flex gap-2">
              <button
                onClick={handleMigrate}
                className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white
                           active:bg-brand-600 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 rounded-xl border border-slate-600 py-3 text-sm text-slate-400
                           active:bg-slate-700 transition-colors"
              >
                Omitir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
