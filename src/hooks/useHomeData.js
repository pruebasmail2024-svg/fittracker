import { useState, useEffect } from 'react'
import { getProfile }             from '../services/profileService'
import { getAllSessions }          from '../services/workoutService'
import { getAllWeightLogs }        from '../services/weightService'
import { getSettings, shouldShowBackupReminder } from '../services/notificationService'
import { resolverEjercicio }       from '../services/rutinaService'
import { useAuth }                 from '../contexts/AuthContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date) {
  const d   = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}

function calcStreak(sessions) {
  const curWeekStart = getWeekStart(new Date())
  let weekStart = new Date(curWeekStart)
  weekStart.setDate(weekStart.getDate() - 7)

  for (let streak = 0; streak < 52; streak++) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const count = sessions.filter(s => {
      const d = new Date(s.startedAt || s.completedAt)
      return d >= weekStart && d <= weekEnd
    }).length

    if (count < 3) return streak
    weekStart.setDate(weekStart.getDate() - 7)
  }
  return 52
}

function findBestProgress(sessions) {
  if (sessions.length < 2) return null
  const last = sessions.at(-1)
  const prev = [...sessions].slice(0, -1).reverse().find(s => s.dayIndex === last.dayIndex)
  if (!prev) return null

  let bestId = null, bestDelta = 0, bestLastMax = 0

  last.exercises.forEach(ex => {
    const prevEx = prev.exercises.find(e => e.exerciseId === ex.exerciseId)
    if (!prevEx || !ex.sets.length || !prevEx.sets.length) return
    const lastMax = Math.max(...ex.sets.map(s => Number(s.weightKg)))
    const prevMax = Math.max(...prevEx.sets.map(s => Number(s.weightKg)))
    const delta   = lastMax - prevMax
    if (delta > bestDelta) { bestDelta = delta; bestId = ex.exerciseId; bestLastMax = lastMax }
  })

  if (!bestId || bestDelta <= 0) return null
  return {
    name:    resolverEjercicio(bestId)?.nombre ?? bestId,
    delta:   bestDelta,
    lastMax: bestLastMax,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeData() {
  const { user }                              = useAuth()
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [profile, setProfile]                 = useState(null)
  const [sessions, setSessions]               = useState([])
  const [weightLogs, setWeightLogs]           = useState([])
  const [refreshKey, setRefreshKey]           = useState(0)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    Promise.all([getProfile(user.id), getAllSessions(user.id), getAllWeightLogs(user.id)])
      .then(([p, s, w]) => {
        setProfile(p)
        setSessions(s)
        setWeightLogs(w)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err)
        setLoading(false)
      })
  }, [user, refreshKey])

  const reload = () => setRefreshKey(k => k + 1)

  const today        = new Date().toDateString()
  const todaySession = sessions.find(s =>
    new Date(s.startedAt || s.completedAt).toDateString() === today
  ) ?? null
  const trainedToday = todaySession !== null

  const nextDayIndex   = sessions.length === 0 ? 0 : (sessions.at(-1).dayIndex + 1) % 3
  const isTrainingDay  = getSettings().days.includes(new Date().getDay())
  const recentSessions = [...sessions].slice(-3).reverse()
  const bestProgress   = findBestProgress(sessions)
  const streak         = calcStreak(sessions)

  const weightCurrent = weightLogs.at(-1)?.weightKg ?? null
  const weightInitial = weightLogs[0]?.weightKg ?? null
  const weightDelta   = weightCurrent != null && weightInitial != null
    ? Math.round((weightCurrent - weightInitial) * 10) / 10
    : null

  const showBackupAlert = profile ? shouldShowBackupReminder(profile.createdAt) : false

  return {
    loading, error,
    profile,
    trainedToday, todaySession, nextDayIndex, isTrainingDay,
    recentSessions, bestProgress, streak,
    weightCurrent, weightInitial, weightDelta,
    showBackupAlert,
    reload,
  }
}
