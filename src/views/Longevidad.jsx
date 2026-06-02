import { useState } from 'react'
import { useWeightStatus }      from '../hooks/useWeightStatus'
import { useConsistencyScore }  from '../hooks/useConsistencyScore'
import WeightStatusBadge        from '../components/WeightStatusBadge'
import WeightLogModal           from '../components/WeightLogModal'

// ─── Colores del score ────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 70) return { stroke: '#4ade80', text: 'text-brand-400' }
  if (score >= 40) return { stroke: '#fbbf24', text: 'text-amber-400' }
  return { stroke: '#f87171', text: 'text-red-400' }
}

// ─── Gauge circular ───────────────────────────────────────────────────────────

function ConsistencyGauge({ score }) {
  const R       = 70
  const CIRCUM  = 2 * Math.PI * R
  const offset  = CIRCUM * (1 - score / 100)
  const { stroke, text } = scoreColor(score)

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        {/* Track */}
        <circle cx="90" cy="90" r={R} fill="none" stroke="#1e293b" strokeWidth="12" />
        {/* Progreso */}
        <circle
          cx="90" cy="90" r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Número central */}
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`text-5xl font-bold tabular-nums ${text}`}>{score}</span>
        <span className="text-xs text-slate-500 mt-1">/ 100</span>
      </div>
    </div>
  )
}

// ─── Desglose del score ───────────────────────────────────────────────────────

function ScoreBreakdown({ current }) {
  const { trainings, trainingPts, weightBonus, score } = current
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3
                    flex flex-col gap-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-400">
          🏋️ {trainings} entreno{trainings !== 1 ? 's' : ''} × 33
        </span>
        <span className="text-slate-200 font-semibold tabular-nums">{trainingPts} pts</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">⚖️ Peso al día</span>
        <span className={`font-semibold tabular-nums ${weightBonus ? 'text-brand-400' : 'text-slate-600'}`}>
          +{weightBonus} pt
        </span>
      </div>
      <div className="border-t border-slate-700 pt-1.5 flex justify-between font-semibold">
        <span className="text-slate-300">Total</span>
        <span className={scoreColor(score).text + ' tabular-nums'}>{score} / 100</span>
      </div>
    </div>
  )
}

// ─── Barras de tendencia (últimas 4 semanas) ──────────────────────────────────

function WeeklyTrend({ weeks }) {
  if (weeks.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Últimas 4 semanas
      </h3>
      <div className="flex gap-2 items-end h-20">
        {weeks.map((week, i) => {
          const { stroke } = scoreColor(week.score)
          const isCurrentWeek = i === weeks.length - 1
          const heightPct = week.score === 0 ? 4 : week.score  // mínimo visible

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500 tabular-nums">{week.score}</span>
              <div className="w-full bg-slate-800 rounded-md h-12 relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full rounded-md transition-all duration-500"
                  style={{ height: `${heightPct}%`, background: stroke,
                           opacity: isCurrentWeek ? 1 : 0.55 }}
                />
              </div>
              <span className="text-xs text-slate-600 text-center leading-tight">
                {week.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function Longevidad() {
  const [showModal, setShowModal] = useState(false)
  const { lastLog, status, label, color, addLog } = useWeightStatus()
  const { weeks, loading, current }               = useConsistencyScore()

  const needsWeightAction = status === 'warning' || status === 'overdue'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Panel de Longevidad</h1>
        <p className="text-sm text-slate-400 mt-1">Tu consistencia esta semana</p>
      </div>

      {/* ── Score de Consistencia Semanal ── */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-5
                      flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-300">Consistencia Semanal</h2>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
            Calculando…
          </div>
        ) : (
          <>
            <ConsistencyGauge score={current.score} />
            <ScoreBreakdown current={current} />
            <WeeklyTrend weeks={weeks} />
          </>
        )}
      </div>

      {/* ── Seguimiento de peso ── */}
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

        {needsWeightAction && (
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

      {/* Placeholder módulos futuros */}
      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-700">
        <span className="text-3xl">🧬</span>
        <p className="text-xs text-center leading-relaxed">
          Próximamente: nutrición y sueño sumarán al score de consistencia
        </p>
      </div>

      <WeightLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={weightKg => { addLog({ weightKg }); setShowModal(false) }}
      />
    </div>
  )
}
