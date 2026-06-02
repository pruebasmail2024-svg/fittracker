/** Formatea segundos en MM:SS. Ej: 2705 → "45:05" */
export function formatDuration(seconds) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Redondea volumen de carga (kg × reps) para mostrar sin decimales. */
export function formatVolume(kgReps) {
  if (!kgReps) return '—'
  return `${Math.round(kgReps).toLocaleString('es-AR')} kg`
}
