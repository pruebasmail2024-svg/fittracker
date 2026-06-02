import { useState } from 'react'
import { useBodyWeightChart }  from '../hooks/useBodyWeightChart'
import { useExerciseHistory }  from '../hooks/useExerciseHistory'
import { useStagnationAlerts } from '../hooks/useStagnationAlerts'
import { useWeightStatus }     from '../hooks/useWeightStatus'
import { formatDateLong }      from '../utils/date'
import { ALL_EXERCISES }       from '../data/workoutPlan'
import BodyWeightChart         from '../components/BodyWeightChart'
import ExerciseSelector        from '../components/ExerciseSelector'
import ExerciseHistoryChart    from '../components/ExerciseHistoryChart'
import ExerciseHistoryTable    from '../components/ExerciseHistoryTable'
import StagnationAlert         from '../components/StagnationAlert'
import RotationAlert           from '../components/RotationAlert'
import WeightStatusBadge       from '../components/WeightStatusBadge'
import WeightLogModal          from '../components/WeightLogModal'

const TABS = ['Peso corporal', 'Ejercicios']

export default function Historial() {
  const [activeTab, setActiveTab]         = useState(0)
  const [selectedExercise, setSelectedEx] = useState(null)
  const [showModal, setShowModal]         = useState(false)

  const { logs, lastLog, status, label, color, addLog } = useWeightStatus()
  const { chartData, profile }                          = useBodyWeightChart()
  const { data: exData, loading: exLoading }            = useExerciseHistory(selectedExercise)
  const { alerts }                                      = useStagnationAlerts()

  const daysSinceStart = profile
    ? (Date.now() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24)
    : 0

  const stalledExercises = Object.entries(alerts)
    .filter(([, stalled]) => stalled)
    .map(([id]) => ALL_EXERCISES.find(e => e.id === id))
    .filter(Boolean)

  const sortedLogs = [...logs].reverse()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-100">Historial</h1>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-800 p-1 gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === i
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-500 active:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Peso corporal ──────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="flex flex-col gap-4">
          <RotationAlert daysSinceStart={daysSinceStart} />

          {/* ── Sección Mi Peso ── */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-4
                          flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-300">Mi Peso</h2>

            {/* Peso actual + fecha */}
            {lastLog ? (
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-100 tabular-nums">
                    {lastLog.weightKg}
                    <span className="text-base font-normal text-slate-500 ml-1">kg</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Último registro: {formatDateLong(lastLog.recordedAt)}
                  </p>
                </div>
                <WeightStatusBadge label={label} color={color} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin registros todavía.</p>
            )}

            {/* Botón de registro */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
                         active:bg-brand-600 transition-colors text-sm"
            >
              + Registrar peso de hoy
            </button>
          </div>

          {/* Gráfico */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">
              Peso real vs proyección ideal
            </h2>
            <BodyWeightChart chartData={chartData} />
          </div>

          {/* Lista de registros */}
          <h2 className="text-base font-semibold text-slate-200">Todos los registros</h2>
          {sortedLogs.length === 0 && (
            <p className="text-slate-500 text-sm">Todavía no hay registros.</p>
          )}
          <ul className="flex flex-col gap-3">
            {sortedLogs.map((log, i) => (
              <WeightCard key={log.id} log={log} isLatest={i === 0} />
            ))}
          </ul>
        </div>
      )}

      {/* ── Tab: Ejercicios ─────────────────────────────────────────── */}
      {activeTab === 1 && (
        <div className="flex flex-col gap-4">
          {stalledExercises.length > 0 && (
            <div className="flex flex-col gap-2">
              {stalledExercises.map(ex => (
                <StagnationAlert key={ex.id} exerciseName={ex.name} />
              ))}
            </div>
          )}

          <ExerciseSelector value={selectedExercise} onChange={setSelectedEx} />

          {selectedExercise && !exLoading && (
            <>
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4">
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                  Evolución — peso máx y reps totales
                </h2>
                <ExerciseHistoryChart data={exData} />
              </div>
              <ExerciseHistoryTable data={exData} />
            </>
          )}

          {!selectedExercise && (
            <p className="text-center text-slate-500 text-sm py-6">
              Seleccioná un ejercicio para ver su evolución.
            </p>
          )}
        </div>
      )}

      {/* Modal de registro */}
      <WeightLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={weightKg => addLog({ weightKg })}
      />
    </div>
  )
}

function WeightCard({ log, isLatest }) {
  return (
    <li className={`flex items-center justify-between rounded-xl px-4 py-3 border
      ${isLatest
        ? 'bg-brand-500/10 border-brand-500/30'
        : 'bg-slate-800/60 border-slate-700/50'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-slate-400">{formatDateLong(log.recordedAt)}</span>
        {isLatest && <span className="text-xs font-medium text-brand-400">Más reciente</span>}
      </div>
      <span className={`text-2xl font-bold tabular-nums
        ${isLatest ? 'text-brand-400' : 'text-slate-200'}`}>
        {log.weightKg}<span className="text-sm font-normal text-slate-500 ml-1">kg</span>
      </span>
    </li>
  )
}
