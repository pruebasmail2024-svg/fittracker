import { openDB } from 'idb'

const DB_NAME = 'training-longevity'
const DB_VERSION = 1

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Perfil del usuario — un solo registro, id siempre = 'me'
    if (!db.objectStoreNames.contains('profile')) {
      db.createObjectStore('profile', { keyPath: 'id' })
    }

    // Historial de peso — inmutable, cronológico
    if (!db.objectStoreNames.contains('weightLogs')) {
      const store = db.createObjectStore('weightLogs', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('by_date', 'recordedAt')
    }

    // Sesiones de entrenamiento (futuro: vista Entrenar)
    if (!db.objectStoreNames.contains('workoutSessions')) {
      const store = db.createObjectStore('workoutSessions', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('by_date', 'startedAt')
    }

    // Registros de nutrición (futuro: vista En Radar)
    if (!db.objectStoreNames.contains('nutritionLogs')) {
      const store = db.createObjectStore('nutritionLogs', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('by_date', 'recordedAt')
    }

    // Registros de sueño (futuro: vista En Radar)
    if (!db.objectStoreNames.contains('sleepLogs')) {
      const store = db.createObjectStore('sleepLogs', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('by_date', 'startedAt')
    }
  },
})
