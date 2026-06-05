import catalogoData from '../data/ejercicios.json'

const TODOS = catalogoData.ejercicios

/**
 * Devuelve el subconjunto de ejercicios que coincide con los filtros.
 * Todos los filtros son opcionales; omitirlos equivale a "todos".
 *
 * @param {Object} filtros
 * @param {string} [filtros.musculo]  - ej: 'pecho', 'espalda'
 * @param {string} [filtros.equipo]   - ej: 'barra', 'mancuernas', 'peso-corporal'
 * @param {string} [filtros.lugar]    - 'gimnasio' | 'casa'
 */
export function filtrarEjercicios({ musculo, equipo, lugar } = {}) {
  return TODOS.filter(ej => {
    if (musculo && ej.musculo !== musculo) return false
    if (equipo  && ej.equipo  !== equipo)  return false
    if (lugar   && !ej.lugar.includes(lugar)) return false
    return true
  })
}

/**
 * Busca un ejercicio por su ID en el catálogo.
 * Devuelve null si no existe.
 *
 * @param {string} id
 */
export function buscarEjercicioPorId(id) {
  return TODOS.find(ej => ej.id === id) ?? null
}

/**
 * Hook que expone el catálogo completo más las funciones de filtrado.
 */
export function useEjerciciosCatalogo() {
  return {
    todos:              TODOS,
    filtrarPor:         filtrarEjercicios,
    buscarPorId:        buscarEjercicioPorId,
    meta:               catalogoData._meta,
  }
}
