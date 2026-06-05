import { useState }              from 'react'
import { useNavigate }          from 'react-router-dom'
import { useHomeData }           from '../hooks/useHomeData'
import { useConsistencyScore }   from '../hooks/useConsistencyScore'
import { useWeightStatus }       from '../hooks/useWeightStatus'
import { useStagnationAlerts }   from '../hooks/useStagnationAlerts'
import { getRutina, resolverEjercicio } from '../services/rutinaService'
import { updateSession, deleteSession } from '../services/workoutService'
import { formatDateLong, formatDateFull } from '../utils/date'
import { formatDuration, formatVolume }  from '../utils/format'
import WeightStatusBadge                 from '../components/WeightStatusBadge'
import ModalEditarSesion                 from '../components/ModalEditarSesion'
import ModalConfirmarBorrado             from '../components/ModalConfirmarBorrado'
import ModalDetalleSesion                from '../components/ModalDetalleSesion'
import Toast                             from '../components/Toast'

// ─── Helper: músculos principales de una sesión ───────────────────────────────

function musculosDeSesion(session) {
  const vistos = new Set()
  const result = []
  for (const ex of session.exercises ?? []) {
    const ej = resolverEjercicio(ex.exerciseId)
    const m  = ej?.musculo
    if (m && !vistos.has(m)) { vistos.add(m); result.push(m) }
    if (result.length >= 3) break
  }
  if (result.length > 0) {
    return result.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')
  }
  // Fallback legacy: nombres de los primeros 2 ejercicios
  return (session.exercises ?? [])
    .slice(0, 2)
    .map(ex => resolverEjercicio(ex.exerciseId)?.nombre ?? ex.exerciseId)
    .join(' · ')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 70) return { stroke: '#4ade80', cls: 'text-brand-400' }
  if (score >= 40) return { stroke: '#fbbf24', cls: 'text-amber-400' }
  return { stroke: '#f87171', cls: 'text-red-400' }
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl px-4 py-3 flex flex-col gap-1 border
      ${accent
        ? 'bg-brand-500/10 border-brand-500/25'
        : 'bg-slate-800/60 border-slate-700/50'}`}
    >
      <span className="text-xs text-slate-500 font-medium leading-none">{label}</span>
      <span className={`text-xl font-bold tabular-nums leading-tight
        ${accent ? 'text-brand-400' : 'text-slate-100'}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-slate-500 leading-none">{sub}</span>}
    </div>
  )
}

function NextSessionCard({ day, trainedToday, todaySession, onStart, onViewHistory, onHomeWorkout }) {
  const totalSets = todaySession
    ? todaySession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    : null

  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 px-5 py-5
                    flex flex-col gap-4">
      {/* Encabezado del card */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {trainedToday ? 'Sesión completada hoy' : 'Próxima sesión'}
        </p>
        <h2 className="text-lg font-bold text-slate-100 mt-0.5">
          {day.label} — {day.focus}
        </h2>
      </div>

      {/* Ejercicios del día — de a pares */}
      <ul className="flex flex-col gap-1">
        {(day.slots ?? []).reduce((acc, slot, i) => {
          if (i % 2 === 0) acc.push([slot, day.slots[i + 1]].filter(Boolean))
          return acc
        }, []).map((par, i) => {
          const nombres = par.map(s => resolverEjercicio(s.exerciseId)?.nombre ?? s.exerciseId)
          return (
            <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
              {nombres.join(' + ')}
            </li>
          )
        })}
      </ul>

      {/* CTA */}
      {trainedToday ? (
        <div className="flex flex-col gap-2">
          <div className="rounded-xl bg-slate-700/50 border border-slate-600/50
                          px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-slate-300">
              ✅ {totalSets} series completadas
            </span>
          </div>
          <button
            onClick={onViewHistory}
            className="w-full rounded-xl border border-slate-600 py-3 text-sm
                       font-medium text-slate-400 active:bg-slate-800 transition-colors"
          >
            Ver sesión completada →
          </button>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white
                     active:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          💪 Iniciar sesión de hoy
        </button>
      )}

      {/* Botón secundario: entrenamiento en casa */}
      <button
        onClick={onHomeWorkout}
        className="w-full rounded-xl border border-slate-700 py-3 text-sm font-medium
                   text-slate-400 active:bg-slate-800 transition-colors"
      >
        🏠 Entrenar en Casa
      </button>
    </div>
  )
}

function RecentSessionRow({ session, index, onDetail, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const rutina   = getRutina()
  const type     = session.sessionType ?? 'gym'
  const day      = session.dayIndex != null ? rutina[session.dayIndex] : null
  const date     = formatDateLong(session.startedAt || session.completedAt)
  const sets     = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const musculos = musculosDeSesion(session)

  const dayLabel = type === 'home_extra'
    ? '🏠 Complemento'
    : type === 'home_replacement'
      ? `🏠 ${day?.label ?? 'Casa'}`
      : day?.label ?? `Día ${(session.dayIndex ?? 0) + 1}`

  return (
    <div className={`relative py-2.5 ${index > 0 ? 'border-t border-slate-700/40' : ''}`}>

      {/* Área tappable principal → abre detalle */}
      <button
        onClick={onDetail}
        className="w-full text-left active:opacity-70 transition-opacity"
      >
        {/* Fila 1: día + fecha + botón ⋯ */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200">{dayLabel} · {date}</p>
            {musculos && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{musculos}</p>
            )}
          </div>
          {/* Botón ⋯ — stopPropagation para que no abra el detalle */}
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="flex items-center justify-center w-11 h-11 -mr-2 -mt-1
                       rounded-xl text-slate-500 active:bg-slate-700 active:text-slate-300
                       transition-colors shrink-0 text-lg"
            aria-label="Acciones"
          >
            ⋯
          </button>
        </div>

        {/* Fila 2: métricas */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {session.durationSeconds > 0 && (
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {formatDuration(session.durationSeconds)}
            </span>
          )}
          <span className="text-xs text-slate-500 tabular-nums">{sets} series</span>
          {session.volumeKg > 0 && (
            <span className="text-xs text-violet-500 tabular-nums">
              {formatVolume(session.volumeKg)}
            </span>
          )}
        </div>
      </button>

      {/* Menú contextual */}
      {menuOpen && (
        <>
          {/* Overlay para cerrar al tocar afuera */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-8 z-40 bg-slate-800 border border-slate-700
                          rounded-2xl shadow-xl overflow-hidden min-w-[180px]">
            <button
              onClick={() => { setMenuOpen(false); onEdit() }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-slate-200
                         active:bg-slate-700 transition-colors text-left"
            >
              ✏️ Editar sesión
            </button>
            <div className="h-px bg-slate-700" />
            <button
              onClick={() => { setMenuOpen(false); onDelete() }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400
                         active:bg-slate-700 transition-colors text-left"
            >
              🗑️ Borrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()

  const {
    loading, trainedToday, todaySession, nextDayIndex, isTrainingDay,
    recentSessions, bestProgress, streak, weightCurrent, weightDelta,
    showBackupAlert, reload,
  } = useHomeData()

  const [detailSession,   setDetailSession]   = useState(null)
  const [editingSession,  setEditingSession]  = useState(null)
  const [deletingSession, setDeletingSession] = useState(null)
  const [toast,           setToast]           = useState('')

  async function handleSaveEdit(updatedExercises) {
    await updateSession(editingSession.id, updatedExercises)
    setEditingSession(null)
    setToast('Sesión actualizada ✓')
    reload()
  }

  function handleEditedFromDetail() {
    setDetailSession(null)
    setToast('Sesión actualizada ✓')
    reload()
  }

  async function handleConfirmDelete() {
    await deleteSession(deletingSession.id)
    setDeletingSession(null)
    setToast('Sesión eliminada')
    reload()
  }

  const { current: weekScore }                           = useConsistencyScore()
  const { status: wStatus, label: wLabel, color: wColor, daysSince } = useWeightStatus()
  const { alerts }                                       = useStagnationAlerts()

  const rutina  = getRutina()
  const nextDay = rutina[nextDayIndex]

  const stalledExercises = Object.entries(alerts)
    .filter(([, v]) => v)
    .map(([id]) => resolverEjercicio(id))
    .filter(Boolean)

  const hasAlerts = stalledExercises.length > 0 || showBackupAlert

  // Subtítulo dinámico
  const subtitle = trainedToday
    ? '✅ Entrenamiento de hoy completado. ¡Bien hecho!'
    : isTrainingDay
      ? '💪 Hoy es día de entreno. ¿Arrancamos?'
      : '🔄 Día de descanso. Recuperate bien.'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        Cargando…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-2">

      {/* ── 1. Header ── */}
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-100">Hola 👋</h1>
          <span className="text-xs text-slate-500 text-right leading-tight capitalize shrink-0">
            {formatDateFull()}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>

      {/* ── 2. Próxima sesión ── */}
      <NextSessionCard
        day={nextDay}
        trainedToday={trainedToday}
        todaySession={todaySession}
        onStart={() => navigate('/entrenar', { state: { autoStartDay: nextDayIndex } })}
        onViewHistory={() => navigate('/historial')}
        onHomeWorkout={() => navigate('/entrenar-casa', { state: { nextDayIndex } })}
      />

      {/* ── 3. Métricas ── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Consistencia"
          value={`${weekScore.score} pts`}
          sub={`${weekScore.trainings} entrenos esta semana`}
          accent={weekScore.score >= 70}
        />
        <MetricCard
          label="Peso actual"
          value={weightCurrent != null ? `${weightCurrent} kg` : '—'}
          sub={
            weightDelta != null
              ? weightDelta >= 0
                ? `+${weightDelta} kg desde el inicio`
                : `${weightDelta} kg desde el inicio`
              : 'Sin datos comparativos'
          }
        />
        <MetricCard
          label="Racha"
          value={streak > 0 ? `${streak} ${streak === 1 ? 'semana' : 'semanas'}` : 'Sin racha aún'}
          sub="semanas con 3 entrenos"
        />
        <div className="rounded-2xl px-4 py-3 flex flex-col gap-1 border
                        bg-slate-800/60 border-slate-700/50">
          <span className="text-xs text-slate-500 font-medium leading-none">Próximo peso</span>
          <div className="mt-1">
            <WeightStatusBadge label={wLabel} color={wColor} />
          </div>
          {wStatus !== 'ok' && (
            <button
              onClick={() => navigate('/historial')}
              className="text-xs text-brand-400 text-left mt-1 leading-none"
            >
              Registrar →
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Progreso reciente ── */}
      {recentSessions.length > 0 && (
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-4
                        flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            Tu progreso reciente
          </h3>

          {/* Mejor progreso */}
          {bestProgress && (
            <div className="rounded-xl bg-brand-500/10 border border-brand-500/20
                            px-3 py-2.5 mb-2">
              <p className="text-xs font-semibold text-brand-300">
                🏆 Mejor marca en {bestProgress.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Subiste +{bestProgress.delta} kg → {bestProgress.lastMax} kg
              </p>
            </div>
          )}

          {/* Últimas 3 sesiones */}
          {recentSessions.map((session, i) => (
            <RecentSessionRow
              key={session.id ?? i}
              session={session}
              index={i}
              onDetail={() => setDetailSession(session)}
              onEdit={() => setEditingSession(session)}
              onDelete={() => setDeletingSession(session)}
            />
          ))}
        </div>
      )}

      {/* ── 5. Alertas activas ── */}
      {hasAlerts && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Alertas activas
          </h3>

          {stalledExercises.map(ex => (
            <div
              key={ex.id}
              className="rounded-xl bg-amber-500/10 border border-amber-500/25
                         px-4 py-3 flex items-start gap-3"
            >
              <span className="text-base shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-300 font-medium">{ex.nombre ?? ex.name}</p>
                <p className="text-xs text-slate-500">Estancamiento detectado · 3 sesiones sin progreso</p>
              </div>
              <button
                onClick={() => navigate('/historial')}
                className="text-xs text-amber-500 shrink-0 active:text-amber-300"
              >
                Ver →
              </button>
            </div>
          ))}

          {showBackupAlert && (
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/25
                            px-4 py-3 flex items-start gap-3">
              <span className="text-base shrink-0">💾</span>
              <div className="flex-1">
                <p className="text-sm text-indigo-300 font-medium">Backup pendiente</p>
                <p className="text-xs text-slate-500">Hace más de 30 días sin descargar tu historial</p>
              </div>
              <button
                onClick={() => navigate('/config')}
                className="text-xs text-indigo-400 shrink-0 active:text-indigo-300"
              >
                Ir →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal detalle de sesión */}
      {detailSession && (
        <ModalDetalleSesion
          session={detailSession}
          onClose={() => setDetailSession(null)}
          onEdited={handleEditedFromDetail}
        />
      )}

      {/* Modal editar sesión (acceso directo desde menú ⋯) */}
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
