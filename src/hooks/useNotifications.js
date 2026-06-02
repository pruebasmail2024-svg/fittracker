import { useState, useEffect, useCallback } from 'react'
import { getAllWeightLogs } from '../services/weightService'
import { getProfile }       from '../services/profileService'
import {
  getPermissionStatus,
  getSettings,
  sendNotification,
  shouldFireWorkoutReminder,  markWorkoutReminderFired,
  shouldFireWeightReminder,   markWeightReminderFired,
  isBannerDismissed,          dismissBannerUntilTomorrow,
  shouldShowBackupReminder,   snoozeBackupReminder,
} from '../services/notificationService'

export function useNotifications() {
  const [permission, setPermission]           = useState(getPermissionStatus)
  const [showBanner, setShowBanner]           = useState(false)
  const [bannerType, setBannerType]           = useState('workout')
  const [showBackupBanner, setShowBackupBanner] = useState(false)

  const check = useCallback(async () => {
    const perm     = getPermissionStatus()
    const settings = getSettings()
    setPermission(perm)

    let shouldShowInApp = false
    let type = null

    // ── Recordatorio de entrenamiento ──────────────────────────────────────
    if (shouldFireWorkoutReminder(settings)) {
      if (perm === 'granted') {
        sendNotification(
          '🏋️ ¡Momento de activar el ejercicio!',
          'Tu sesión de 40 minutos te espera. Vamos por el progreso de hoy.'
        )
        markWorkoutReminderFired()
      } else if (!isBannerDismissed()) {
        shouldShowInApp = true
        type = 'workout'
      }
    }

    // ── Recordatorio de peso quincenal ─────────────────────────────────────
    const logs    = await getAllWeightLogs()
    const lastLog = logs.at(-1)
    const daysSince = lastLog
      ? (Date.now() - new Date(lastLog.recordedAt)) / (1000 * 60 * 60 * 24)
      : Infinity

    if (shouldFireWeightReminder(daysSince)) {
      if (perm === 'granted') {
        sendNotification(
          '⚖️ Registro Quincenal Pendiente',
          'Es hora de actualizar tu peso para contrastarlo con la curva de proyección.'
        )
        markWeightReminderFired()
      } else if (!isBannerDismissed()) {
        shouldShowInApp = true
        type = type ?? 'weight'
      }
    }

    if (shouldShowInApp) {
      setBannerType(type)
      setShowBanner(true)
    }

    // ── Recordatorio de backup (30 días) ───────────────────────────────────
    const profile = await getProfile()
    if (profile && shouldShowBackupReminder(profile.createdAt)) {
      if (perm === 'granted') {
        sendNotification(
          '💾 Recordatorio de backup',
          'Descargá tu historial de FitTracker para no perder tu progreso.'
        )
      }
      // El banner de backup se muestra siempre (independiente del permiso)
      setShowBackupBanner(true)
    }
  }, [])

  useEffect(() => {
    check()
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [check])

  const dismissBanner = useCallback(() => {
    dismissBannerUntilTomorrow()
    setShowBanner(false)
  }, [])

  const dismissBackupBanner = useCallback(() => {
    snoozeBackupReminder(7)
    setShowBackupBanner(false)
  }, [])

  return {
    permission, setPermission,
    showBanner, bannerType, dismissBanner,
    showBackupBanner, dismissBackupBanner,
  }
}
