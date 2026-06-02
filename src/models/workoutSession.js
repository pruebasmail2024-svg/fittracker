/**
 * exercises: [{ exerciseId, sets: [{ weightKg, reps }] }]
 * durationSeconds: tiempo total de la sesión en segundos
 * volumeKg: suma de (weightKg × reps) de todos los sets (carga total)
 */
export function createWorkoutSession({ dayIndex, startedAt, exercises, durationSeconds = 0 }) {
  const volumeKg = exercises.reduce((total, ex) =>
    total + ex.sets.reduce((t, s) => t + Number(s.weightKg) * Number(s.reps), 0),
  0)

  return {
    dayIndex,
    startedAt,
    completedAt:     new Date().toISOString(),
    durationSeconds: Math.round(durationSeconds),
    volumeKg:        Math.round(volumeKg),
    exercises,
  }
}
