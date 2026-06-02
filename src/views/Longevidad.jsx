import { useState } from 'react'
import { useWeightStatus } from '../hooks/useWeightStatus'
import WeightStatusBadge  from '../components/WeightStatusBadge'
import WeightLogModal     from '../components/WeightLogModal'

export default function Longevidad() {
  const [showModal, setShowModal]       = useState(false)
  const { lastLog, status, label, color, addLog } = useWeightStatus()

  const needsAction = status === 'warning' || status === 'overdue'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Panel de Longevidad</h1>
        <p className="text-sm text-slate-400 mt-1">
          Métricas de salud a largo plazo
        </p>
      </div>

      {/* Card de estado de peso */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-4
                      flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Seguimiento de peso</h2>
          <WeightStatusBadge label={label} color={color} />
        </div>

        {lastLog && (
          <p className="text-sm text-slate-400">
            Último registro:{' '}
            <span className="text-slate-200 font-semibold tabular-nums">
              {lastLog.weightKg} kg
            </span>
          </p>
        )}

        {needsAction && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-xl border border-brand-500/50 bg-brand-500/10
                       py-3 text-sm font-semibold text-brand-400
                       active:bg-brand-500/20 transition-colors"
          >
            ⚖️ Registrar peso ahora
          </button>
        )}
      </div>

      {/* Placeholder para futuras métricas */}
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-600">
        <span className="text-4xl">🧬</span>
        <p className="text-sm">Próximamente: más métricas de longevidad</p>
      </div>

      <WeightLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={weightKg => { addLog({ weightKg }); setShowModal(false) }}
      />
    </div>
  )
}
