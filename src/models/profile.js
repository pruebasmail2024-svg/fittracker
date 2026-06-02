/**
 * Crea un objeto perfil listo para guardar en IndexedDB.
 * id fijo 'me' porque solo hay un perfil por app.
 */
export function createProfile({ age, weightKg, heightCm }) {
  return {
    id: 'me',
    age: Number(age),
    weightKg: Number(weightKg),
    heightCm: Number(heightCm),
    createdAt: new Date().toISOString(),
  }
}
