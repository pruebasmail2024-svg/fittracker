import { useState, useEffect } from 'react'
import { useBodyWeightChart }  from '../hooks/useBodyWeightChart'
import { useExerciseHistory }  from '../hooks/useExerciseHistory'
import { useStagnationAlerts } from '../hooks/useStagnationAlerts'
import { useWeightStatus }     from '../hooks/useWeightStatus'
import { formatDateLong }      from '../utils/date'
import { formatDuration, formatVolume } from '../utils/format'
import { resolverEjercicio, getRutina } from '../services/rutinaService'
import { getAllSessions, updateSession, deleteSession } from '../services/workoutService'
import { useAuth } from '../contexts/AuthContext'
import BodyWeightChart         from '../components/BodyWeightChart'
import ExerciseSelector        from '../components/ExerciseSelector'
import ExerciseHistoryChart    from '../components/ExerciseHistoryChart'
import ExerciseHistoryTable    from '../components/ExerciseHistoryTable'
import StagnationAlert         from '../components/StagnationAlert'
import RotationAlert           from '../components/RotationAlert'
import WeightStatusBadge       from '../components/WeightStatusBadge'
import WeightLogModal          from '../components/WeightLogModal'
import ModalEditarSesion       from '../components/ModalEditarSesion'
import ModalConfirmarBorrado   from '../components/ModalConfirmarBorrado'
import Toast                   from '../components/Toast'

const TABS = ['Peso corporal', 'Ejercicios', 'Sesiones']

export default function Historial() {
  const { user }                          = useAuth()
  const [activeTab, setActiveTab]         = useState(0)
  const [allSessions, setAllSessions]     = useState([])
  const [selectedExercise, setSelectedEx] = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [rutina, setRutina]               = useState(null)

  // ── Estado editar / borrar ──
  const [editingSession,   setEditingSession]   = useState(null)
  const [deletingSession,  setDeletingSession]  = useState(null)
  const [toast,            setToast]            = useState('')

  const reloadSessions = () => {
    if (!user) return
    getAllSessions(user.id).then(s => setAllSessions([...s].reverse()))
  }

  useEffect(() => {
    if (!user) return
    reloadSessions()
    getRutina(user.id).then(setRutina)
  }, [user])

  const { logs, lastLog, status, label, color, addLog } = useWeightStatus()
  const { chartData, profile }                          = useBodyWeightChart()
  const { data: exData, loading: exLoading }            = useExerciseHistory(selectedExercise)
  const { alerts }                                      = useStagnationAlerts()

  const daysSinceStart = profile
    ? (Date.now() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24)
    : 0

  const stalledExercises = Object.entries(alerts)
    .filter(([, stalled]) => stalled)
    .map(([id]) => resolverEjercicio(id))
    .filter(Boolean)

  async function handleSaveEdit(updatedExercises) {
    await updateSession(user.id, editingSession.id, updatedExercises)
    setEditingSession(null)
    setToast('Sesión actualizada ✓')
    reloadSessions()
  }

  async function handleConfirmDelete() {
    await deleteSession(user.id, deletingSession.id)
    setDeletingSession(null)
    setToast('Sesión eliminada')
    reloadSessions()
  }

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
                <StagnationAlert key={ex.id} exerciseName={ex.nombre ?? ex.name} />
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

      {/* ── Tab: Sesiones ───────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="flex flex-col gap-3">
          {allSessions.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">
              Todavía no hay sesiones registradas.
            </p>
          )}
          {allSessions.map((session, i) => (
            <SessionRow
              key={session.id ?? i}
              session={session}
              rutina={rutina}
              onEdit={() => setEditingSession(session)}
              onDelete={() => setDeletingSession(session)}
            />
          ))}
        </div>
      )}

      {/* Modal de registro de peso */}
      <WeightLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={weightKg => addLog({ weightKg })}
      />

      {/* Modal editar sesión */}
      {editingSession && (
        <ModalEditarSesion
          session={editingSession}
          onSave={handleSaveEdit}
          onClose={() => setEditingSession(null)}
        />
      )}

      {/* Modal confirmar borrado */}
      {deletingSession && (
        <ModalConfirmarBorrado
          session={deletingSession}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingSession(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}

function SessionRow({ session, rutina, onEdit, onDelete }) {
  const type = session.sessionType ?? 'gym'
  const day  = session.dayIndex != null ? rutina?.[session.dayIndex] : null
  const sets   = (session.exercises ?? []).reduce((acc, ex) => acc + ex.sets.length, 0)

  const label = type === 'home_replacement'
    ? `🏠 Casa — reemplazó ${day?.label ?? ''}`
    : type === 'home_extra'
      ? '🏠 Casa — complemento'
      : `🏋️ ${day?.label ?? 'Gym'}`

  const labelColor = type === 'gym' ? 'text-brand-400' : 'text-sky-400'

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-3
                    flex flex-col gap-3">
      {/* Info principal */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
          <span className="text-xs text-slate-500">
            {formatDateLong(session.startedAt || session.completedAt)}
          </span>
          {session.editadaEl && (
            <span className="text-xs text-slate-600 italic">
              Editada el {formatDateLong(session.editadaEl)}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {session.durationSeconds > 0 && (
            <span className="text-xs text-slate-400 tabular-nums font-mono">
              {formatDuration(session.durationSeconds)}
            </span>
          )}
          <span className="text-xs text-slate-500">{sets} series</span>
          {session.volumeKg > 0 && (
            <span className="text-xs text-violet-500 tabular-nums">
              {formatVolume(session.volumeKg)}
            </span>
          )}
        </div>
      </div>

      {/* Botones editar / borrar */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl
                     border border-slate-600 py-2.5 text-xs font-semibold text-slate-400
                     active:bg-slate-700 transition-colors min-h-[44px]"
        >
          ✏️ Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl
                     border border-red-500/30 bg-red-500/5 py-2.5 text-xs font-semibold
                     text-red-400 active:bg-red-500/15 transition-colors min-h-[44px]"
        >
          🗑️ Borrar
        </button>
      </div>
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
