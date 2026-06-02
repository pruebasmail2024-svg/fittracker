/**
 * Crea un registro de peso listo para guardar en IndexedDB.
 * Sin id: lo asigna IndexedDB con autoIncrement.
 * recordedAt es ISO string para que el índice by_date funcione correctamente.
 */
export function createWeightLog({ weightKg, recordedAt }) {
  return {
    weightKg: Number(weightKg),
    recordedAt: recordedAt ?? new Date().toISOString(),
  }
}
