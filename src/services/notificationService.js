// ─── Claves de localStorage ───────────────────────────────────────────────────

const KEYS = {
  settings:           'fittracker_notif_settings',
  lastWorkoutFired:   'fittracker_last_workout_notif',
  lastWeightFired:    'fittracker_last_weight_notif',
  bannerDismissed:    'fittracker_banner_dismissed',
  lastBackup:         'fittracker_last_backup',
  backupSnoozed:      'fittracker_backup_reminder_until',
}

// ─── Configuración ────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  enabled: false,
  days: [1, 3, 5],   // Lunes, Miércoles, Viernes (getDay() values)
  hour: 19,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEYS.settings)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings))
}

// ─── Permiso del navegador ────────────────────────────────────────────────────

export function getPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission  // 'default' | 'granted' | 'denied'
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

// ─── Envío de notificación ────────────────────────────────────────────────────

export function sendNotification(title, body) {
  if (getPermissionStatus() !== 'granted') return false
  try {
    new Notification(title, { body, icon: '/icon.svg' })
    return true
  } catch {
    return false
  }
}

// ─── Lógica de "¿corresponde disparar?" ──────────────────────────────────────

function firedToday(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return false
  return new Date(raw).toDateString() === new Date().toDateString()
}

function markFired(key) {
  localStorage.setItem(key, new Date().toISOString())
}

/**
 * Devuelve true si corresponde disparar el recordatorio de entrenamiento.
 * Ventana de disparo: desde la hora configurada hasta 2 horas después,
 * una sola vez por día.
 */
export function shouldFireWorkoutReminder(settings) {
  if (!settings?.enabled) return false
  const now  = new Date()
  const day  = now.getDay()
  const hour = now.getHours()

  if (!settings.days.includes(day)) return false
  if (hour < settings.hour || hour >= settings.hour + 2) return false
  if (firedToday(KEYS.lastWorkoutFired)) return false

  return true
}

export function markWorkoutReminderFired() { markFired(KEYS.lastWorkoutFired) }

/**
 * Devuelve true si el último registro de peso supera los 15 días,
 * y aún no se disparó la notificación hoy.
 */
export function shouldFireWeightReminder(daysSinceLastLog) {
  if (daysSinceLastLog <= 15) return false
  if (firedToday(KEYS.lastWeightFired)) return false
  return true
}

export function markWeightReminderFired() { markFired(KEYS.lastWeightFired) }

// ─── Banner in-app fallback ───────────────────────────────────────────────────

export function isBannerDismissed() {
  const raw = localStorage.getItem(KEYS.bannerDismissed)
  if (!raw) return false
  return new Date(raw) > new Date()
}

export function dismissBannerUntilTomorrow() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  localStorage.setItem(KEYS.bannerDismissed, tomorrow.toISOString())
}

// ─── Backup de historial (recordatorio de 30 días) ────────────────────────────

/**
 * Marca que el usuario acaba de descargar el backup.
 * Llamado desde exportService después de generar el ZIP.
 */
export function markBackupDownloaded() {
  localStorage.setItem(KEYS.lastBackup, new Date().toISOString())
}

/**
 * Devuelve true si pasaron más de 30 días desde el último backup
 * (o desde la creación del perfil si nunca se hizo backup).
 */
export function shouldShowBackupReminder(profileCreatedAt) {
  const snoozed = localStorage.getItem(KEYS.backupSnoozed)
  if (snoozed && new Date(snoozed) > new Date()) return false

  const lastBackup     = localStorage.getItem(KEYS.lastBackup)
  const referenceDate  = lastBackup ?? profileCreatedAt
  if (!referenceDate) return false

  const daysSince = (Date.now() - new Date(referenceDate)) / (1000 * 60 * 60 * 24)
  return daysSince > 30
}

/** Postpone el recordatorio de backup N días (por defecto 7). */
export function snoozeBackupReminder(days = 7) {
  const until = new Date()
  until.setDate(until.getDate() + days)
  localStorage.setItem(KEYS.backupSnoozed, until.toISOString())
}
