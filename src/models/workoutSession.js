/**
 * exercises: [{ exerciseId, sets: [{ weightKg, reps }] }]
 */
export function createWorkoutSession({ dayIndex, startedAt, exercises }) {
  return {
    dayIndex,
    startedAt,
    completedAt: new Date().toISOString(),
    exercises,
  }
}
