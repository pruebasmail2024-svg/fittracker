import { useNavigate }          from 'react-router-dom'
import { useHomeData }           from '../hooks/useHomeData'
import { useConsistencyScore }   from '../hooks/useConsistencyScore'
import { useWeightStatus }       from '../hooks/useWeightStatus'
import { useStagnationAlerts }   from '../hooks/useStagnationAlerts'
import { WORKOUT_PLAN, ALL_EXERCISES } from '../data/workoutPlan'
import { formatDateLong, formatDateFull } from '../utils/date'
import { formatDuration, formatVolume }  from '../utils/format'
import WeightStatusBadge                 from '../components/WeightStatusBadge'

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

function NextSessionCard({ day, trainedToday, todaySession, onStart, onViewHistory }) {
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

      {/* Ejercicios del día */}
      <ul className="flex flex-col gap-1">
        {day.pairs.map((pair, i) => (
          <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
            {pair.exercises.map(e => e.name).join(' + ')}
          </li>
        ))}
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
    </div>
  )
}

function RecentSessionRow({ session, index }) {
  const day  = WORKOUT_PLAN[session.dayIndex]
  const date = formatDateLong(session.startedAt || session.completedAt)
  const sets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div className={`flex items-center justify-between py-2.5
      ${index > 0 ? 'border-t border-slate-700/40' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-200">{day?.label ?? `Día ${session.dayIndex + 1}`}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
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
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()

  const {
    loading, trainedToday, todaySession, nextDayIndex, isTrainingDay,
    recentSessions, bestProgress, streak, weightCurrent, weightDelta,
    showBackupAlert,
  } = useHomeData()

  const { current: weekScore }                           = useConsistencyScore()
  const { status: wStatus, label: wLabel, color: wColor, daysSince } = useWeightStatus()
  const { alerts }                                       = useStagnationAlerts()

  const nextDay = WORKOUT_PLAN[nextDayIndex]

  const stalledExercises = Object.entries(alerts)
    .filter(([, v]) => v)
    .map(([id]) => ALL_EXERCISES.find(e => e.id === id))
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
            <RecentSessionRow key={session.id ?? i} session={session} index={i} />
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
                <p className="text-sm text-amber-300 font-medium">{ex.name}</p>
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
    </div>
  )
}
