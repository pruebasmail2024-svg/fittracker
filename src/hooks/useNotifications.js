import { useState, useEffect, useCallback } from 'react'
import { getAllWeightLogs } from '../services/weightService'
import {
  getPermissionStatus,
  getSettings,
  sendNotification,
  shouldFireWorkoutReminder, markWorkoutReminderFired,
  shouldFireWeightReminder,  markWeightReminderFired,
  isBannerDismissed, dismissBannerUntilTomorrow,
} from '../services/notificationService'

export function useNotifications() {
  const [permission, setPermission] = useState(getPermissionStatus)
  const [showBanner, setShowBanner] = useState(false)
  const [bannerType, setBannerType] = useState('workout') // 'workout' | 'weight'

  const check = useCallback(async () => {
    const perm     = getPermissionStatus()
    const settings = getSettings()
    setPermission(perm)

    let shouldShowBanner = false
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
        shouldShowBanner = true
        type = 'workout'
      }
    }

    // ── Recordatorio de peso quincenal ─────────────────────────────────────
    const logs = await getAllWeightLogs()
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
        shouldShowBanner = true
        type = type ?? 'weight'  // peso tiene menor prioridad que entrenamiento
      }
    }

    if (shouldShowBanner) {
      setBannerType(type)
      setShowBanner(true)
    }
  }, [])

  // Chequear al montar y cada vez que el usuario vuelve a la pestaña
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

  return { permission, setPermission, showBanner, bannerType, dismissBanner }
}
