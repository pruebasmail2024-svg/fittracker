# FitTracker — Training & Longevity App

SPA personal de entrenamiento y longevidad, diseñada para usar en el gimnasio
desde el celular. MVP completo con persistencia local (sin backend), PWA
instalable en iOS y Android.

**Usuario objetivo:** persona que entrena 3 veces por semana con rutina de
fuerza full-body, quiere seguimiento de progreso, registro de peso corporal
y alertas inteligentes, todo sin depender de una conexión a internet.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.3 | UI declarativa |
| Vite | 5.4 | Bundler + HMR |
| Tailwind CSS | 3.4 | Estilos utility-first, dark mode |
| React Router | v6.26 | Navegación client-side |
| idb | 8.0 | Wrapper moderno de IndexedDB |
| Recharts | 3.8 | Gráficos de líneas |
| fflate | 0.8 | ZIP en el navegador (export/import) |
| vite-plugin-pwa | 1.3 | Service Worker + Web Manifest |

---

## Cómo correr la app localmente

```bash
npm install
npm run dev
```

Abre **http://localhost:5173** en el navegador.

Para acceder desde el celular en la misma red WiFi:

```bash
npm run dev -- --host
```

Abrí la URL que aparece en `Network:` (ej. `http://192.168.1.X:5173`).

> ⚠️ El modo offline de la PWA NO funciona desde la red local (HTTP). Para
> offline real, usar la URL de Vercel (HTTPS). El servidor local solo sirve
> para desarrollo.

---

## Deploy en producción

La app está deployada en Vercel con deploy automático desde GitHub:

```bash
git add .
git commit -m "descripción"
git push   # Vercel detecta el push y deploya en 1-2 min
```

Los usuarios en el celular reciben la nueva versión la próxima vez que abren la app
(el Service Worker detecta el cambio en segundo plano).

---

## Cómo instalarla como PWA en iOS (Safari)

1. Abrí la app en Safari desde tu iPhone (usar URL de Vercel, no la local)
2. Navegá todas las pantallas ~30 segundos para que el Service Worker cachee todo
3. Tocá el botón de **compartir** (ícono de cuadrado con flecha ↑)
4. Deslizá y tocá **"Agregar a pantalla de inicio"**
5. El nombre aparece como "FitTracker" — tocá **Agregar**

Una vez instalada funciona **sin conexión** — todos los assets y GIFs están
cacheados por el Service Worker.

> Requiere iOS 16.4+ para soporte completo de PWA. Chrome en iOS NO puede
> instalar PWAs (limitación de Apple).

---

## Estructura de carpetas

```
src/
├── components/
│   ├── ExerciseCard.jsx          # GIF + cues + error común durante sesión de gym
│   ├── ExerciseSelector.jsx      # Selector con ejercicios del historial (desde catálogo)
│   ├── HomeExerciseCard.jsx      # Card de ejercicio en sesión de casa (editable)
│   ├── HomeExercisePicker.jsx    # Modal selector con catálogo filtrado por casa
│   ├── MiRutina.jsx              # Sección de Configuración para personalizar rutina
│   ├── ModalConfirmarBorrado.jsx # Confirmación antes de borrar sesión
│   ├── ModalDetalleSesion.jsx    # Detalle completo de sesión con botón editar
│   ├── ModalEditarSesion.jsx     # Edición in-place de series de una sesión
│   ├── Toast.jsx                 # Feedback temporal (2.5s)
│   └── [otros componentes UI]
├── data/
│   ├── ejercicios.json           # Catálogo único de 41 ejercicios (FUENTE DE VERDAD)
│   ├── workoutPlan.js            # Rutina original de 3 días — SOLO LECTURA, no modificar
│   └── homeExercises.js          # Catálogo viejo de casa — SOLO LECTURA, no modificar
├── hooks/
│   ├── useEjerciciosCatalogo.js  # filtrarPor(), buscarPorId(), useEjerciciosCatalogo()
│   ├── useExerciseHistory.js     # Evolución de un ejercicio por exerciseId
│   ├── useHomeData.js            # Datos del dashboard Home + reload()
│   ├── useHomeWorkoutSession.js  # Estado de sesión libre en casa
│   ├── useStagnationAlerts.js    # Detecta estancamiento en la rutina activa
│   ├── useWorkoutSession.js      # Estado de sesión de gym (lee de rutinaService)
│   └── [otros hooks]
├── layout/
│   └── AppShell.jsx              # Header + nav inferior (6 tabs) + banners
├── models/
│   ├── profile.js
│   ├── weightLog.js
│   └── workoutSession.js         # sessionType: 'gym'|'home_replacement'|'home_extra'
├── services/
│   ├── analyticsService.js       # detectStagnation, generateWeightProjection, ROTATION_VARIANTS
│   ├── consistencyService.js
│   ├── db.js                     # openDB con 5 stores (IndexedDB)
│   ├── exportService.js          # ZIP con 3 CSVs (incluye ejercicio_nombre)
│   ├── importService.js
│   ├── notificationService.js
│   ├── profileService.js
│   ├── rutinaService.js          # Rutina personalizable en localStorage (VER ABAJO)
│   ├── weightService.js
│   └── workoutService.js         # CRUD de sesiones: save, getAll, update, delete
├── utils/
│   ├── date.js                   # Formateo de fechas en es-AR
│   └── format.js                 # formatDuration, formatVolume
└── views/
    ├── Configuracion.jsx         # Notificaciones + Mi Rutina + Mis Datos
    ├── EnRadar.jsx               # Placeholder nutrición y sueño
    ├── Entrenar.jsx              # Sesión de gym con GIFs, sets, cronómetros
    ├── Historial.jsx             # Peso vs proyección + evolución + lista de sesiones
    ├── Home.jsx                  # Dashboard principal
    ├── HomeWorkout.jsx           # Sesión libre en casa
    ├── Longevidad.jsx            # Score de consistencia semanal + peso
    └── Onboarding.jsx
```

---

## Vistas (rutas)

| Vista | Ruta | Descripción |
|---|---|---|
| Home | `/` | Dashboard: próxima sesión, métricas, alertas, racha |
| Entrenar | `/entrenar` | Sesión de gym con GIFs, sets, cronómetros |
| Entrenar en Casa | `/entrenar-casa` | Sesión libre con catálogo filtrado por lugar: casa |
| Historial | `/historial` | Peso vs proyección + evolución por ejercicio + sesiones editables |
| Longevidad | `/longevidad` | Score de consistencia semanal + seguimiento de peso |
| En Radar | `/en-radar` | Placeholders nutrición y sueño (próximamente) |
| Configuración | `/config` | Notificaciones + Mi Rutina + Mis Datos (export/import) |

---

## Funcionalidades del MVP

### Catálogo de ejercicios (`src/data/ejercicios.json`)
- **41 ejercicios** con GIFs optimizados (121–175 KB c/u) en `public/exercises/`
- Cada ejercicio tiene: `id`, `nombre`, `musculo`, `musculosSecundarios`, `equipo`,
  `lugar`, `mecanica`, `nivel`, `gif`, `cues`, `commonError`
- Filtros disponibles: `musculo`, `equipo`, `lugar` (`'gimnasio'`|`'casa'`)
- Acceso via hook: `useEjerciciosCatalogo()` → `filtrarPor()`, `buscarPorId()`
- Resolución de ID a objeto: `resolverEjercicio(id)` en `rutinaService.js`

### Rutina personalizable (`src/services/rutinaService.js`)
- La rutina de 3 días se guarda en **localStorage** bajo `fittracker_rutina`
- Si el usuario nunca personalizó → devuelve la rutina default (mismos 12 ejercicios
  mapeados a los nuevos IDs del catálogo)
- **Mapa de compatibilidad** de IDs viejos → nuevos:
  `squat` → `sentadilla-con-barra`, `bench-press` → `press-de-banca-con-barra`,
  `lat-pulldown` → `jalon-al-pecho`, `romanian-deadlift` → `peso-muerto-rumano`,
  `overhead-press` → `press-militar-con-barra`, `barbell-row` → `remo-con-barra`,
  `plank` → `plancha`, `lunge` → `zancadas-con-mancuernas`,
  `bicep-curl` → `curl-con-barra`, `tricep-extension` → `extension-de-triceps-con-mancuerna`
- `farmers-walk` e `incline-bench-press` no tienen equivalente en el catálogo → se
  definen como **LEGACY_EXERCISES** dentro de `rutinaService.js`
- API: `getRutina()`, `updateSlot(dayIndex, slotIndex, cambios)`, `resetDia(dayIndex)`,
  `getDiaParaSesion(dayIndex)`, `resolverEjercicio(id)`
- Cada slot tiene: `exerciseId`, `sets`, `repsMin`, `repsMax`, `esPausa`
- Ejercicios pausa (`esPausa: true`): Plancha y Caminata del Granjero — guardan
  segundos en el campo `reps`

### Sección "Mi Rutina" en Configuración
- 3 cards (Día 1, 2, 3) con GIF thumbnail + nombre + sets×reps de cada slot
- Vista de edición por día: cambiar ejercicio del slot (modal con catálogo filtrado),
  editar sets/reps, restaurar defaults con confirmación
- Al cambiar un ejercicio: el historial del ejercicio anterior NO se pierde,
  el nuevo ejercicio empieza historial limpio desde cero
- Componente: `src/components/MiRutina.jsx`

### Entrenamiento de gym
- Lee la rutina del usuario via `getDiaParaSesion(dayIndex)` — no de `workoutPlan.js`
- GIF + cues + commonError desde el catálogo para todos los ejercicios
- Autocomplete de peso/reps desde la última sesión del mismo `exerciseId`
- Sobrecarga progresiva: referencia visible de la sesión anterior
- Cronómetro de descanso (45s) con beep y vibración
- Cronómetro ascendente de sesión (referencia absoluta con `Date.now()`)
- Alerta de estancamiento: 3 sesiones consecutivas sin progreso

### Entrenamiento en casa
- Catálogo dinámico: `filtrarEjercicios({ lugar: 'casa' })` — no hardcodeado
- Filtros en el picker: músculo + equipo
- Sesión libre: el usuario elige ejercicios; puede agregar el mismo más de una vez
- Dos modos: "Reemplaza gym" (cuenta para el score) o "Complemento extra" (no cuenta)
- Sobrecarga progresiva por `exerciseId`

### Editar y borrar sesiones
- **Editar**: `updateSession(id, exercises)` en `workoutService.js` → edición in-place,
  recalcula `volumeKg`, agrega `editadaEl` con timestamp
- **Borrar**: `deleteSession(id)` en `workoutService.js`
- Acceso desde **Historial → tab Sesiones**: botones ✏️ Editar y 🗑️ Borrar en cada fila
- Acceso desde **Home → "Tu progreso reciente"**: ícono ⋯ por sesión → menú contextual
- Modal de edición (`ModalEditarSesion`): lista de ejercicios expandibles con
  series editables; aviso "cambios sin guardar" al cancelar con cambios pendientes
- Modal de borrado (`ModalConfirmarBorrado`): muestra detalle de la sesión, siempre
  requiere confirmación explícita
- Toast de feedback temporal (`Toast.jsx`) tras guardar o borrar
- Impacto automático en métricas: los hooks leen de IndexedDB en cada render, no
  hay caché en memoria, los cambios se reflejan al recargar los datos

### Detalle de sesión
- Modal `ModalDetalleSesion`: header con fecha/tipo, stats (duración, series, volumen),
  lista de ejercicios con todas las series desglosadas (kg × reps o seg para pausas)
- Acceso: tocar el área principal de cualquier card de sesión en Home
- Incluye botón "✏️ Editar sesión" que abre directamente `ModalEditarSesion`

### Selector de ejercicios en Historial
- `ExerciseSelector` solo muestra los ejercicios que tienen al menos una sesión
  registrada — no la lista completa del catálogo
- Agrupa los ejercicios por músculo con `<optgroup>`
- Resuelve nombres desde el catálogo por `exerciseId`; fallback al ID para ejercicios
  legacy no encontrados en el catálogo

### Cards de sesión en Home
- Cada sesión en "Tu progreso reciente" muestra:
  - Título: "Día X · fecha" o "🏠 Casa · fecha"
  - Músculos principales trabajados (máx 3, derivados del catálogo)
  - Métricas: duración · series · volumen
- Tocar el área principal → abre `ModalDetalleSesion`
- Ícono `⋯` → menú contextual con "✏️ Editar sesión" y "🗑️ Borrar sesión"

### Peso corporal
- Registro quincenal con historial cronológico inmutable
- Curva de proyección hardgainer (mes 1: +2kg, mes 2: +1kg, mes 3: +1kg, +0.5kg/mes)
- Gráfico dual: peso real vs proyección ideal
- Indicador de estado: verde/amarillo/rojo según días desde el último registro

### Analytics y consistencia
- Score de consistencia semanal (0–100): 33pts por entreno + 1pt peso al día
- `home_extra` no cuenta; `home_replacement` cuenta igual que gym
- Racha de semanas consecutivas con 3 entrenos (solo semanas completas)
- `ROTATION_VARIANTS` en `analyticsService.js` usa IDs del catálogo nuevo

### Datos y backup
- Export: ZIP con 3 CSVs (peso, entrenamientos, consistencia semanal)
  — entrenamientos incluye columnas `ejercicio_id` y `ejercicio_nombre`
- Import: restauración completa desde ZIP con preview y confirmación

---

## Arquitectura y decisiones de diseño

### Persistencia: IndexedDB vía `idb`
**5 stores en `db.js` (versión 1):**
- `profile` — un solo registro, keyPath `id = 'me'`
- `weightLogs` — historial inmutable, índice `by_date`
- `workoutSessions` — gym + casa, índice `by_date`, keyPath `id` autoincremental
- `nutritionLogs` — vacío, reservado para futuro
- `sleepLogs` — vacío, reservado para futuro

**localStorage** se usa para:
- Configuración de notificaciones
- Fechas de snooze de banners
- Fecha del último backup
- **Rutina personalizada del usuario** (`fittracker_rutina`)

### Capas de código
```
UI (views/components)
    ↓ usa hooks
Hooks (estado + lógica de UI)
    ↓ llaman a servicios
Services (acceso a datos)
    ↓ usan modelos
Models (factories de objetos)
    ↓ escriben en
IndexedDB / localStorage
```

Los componentes nunca llaman a servicios directamente — siempre via hooks. Los servicios son funciones async puras sin estado de React. **Excepción aceptada**: los modales de edición/borrado y `MiRutina` llaman a servicios directamente porque son componentes de acción puntual, no de datos persistentes.

### Modelo de sesión
`workoutSession` tiene:
- `sessionType`: `'gym'` | `'home_replacement'` | `'home_extra'`
- `exercises`: `[{ exerciseId, sets: [{ weightKg, reps }] }]`
- `volumeKg`: calculado al guardar y recalculado al editar
- `editadaEl`: timestamp de la última edición (solo si fue editada)

Las sesiones antiguas sin `sessionType` usan `s.sessionType ?? 'gym'` como fallback.

### Identificadores de ejercicios
- Los IDs actuales son slugs descriptivos: `'sentadilla-con-barra'`, `'jalon-al-pecho'`
- Los IDs viejos (`'squat'`, `'bench-press'`) aún pueden existir en sesiones guardadas
- `resolverEjercicio(id)` traduce viejos → nuevos y devuelve el objeto del catálogo.
  Siempre usarlo para mostrar datos de un ejercicio del historial, nunca buscar
  directo en el catálogo
- `useExerciseHistory(exerciseId)` busca por `exerciseId` en todas las sesiones —
  funciona con IDs viejos y nuevos

### Flujo completo de una sesión de gym
1. `useWorkoutSession.startDay(dayIndex)` → llama `getDiaParaSesion(dayIndex)`
   que lee la rutina del usuario desde `rutinaService`
2. Carga el historial previo de cada ejercicio con `buildLastDataMap`
3. El usuario registra series → `logSet()` acumula en `loggedData`
4. Al completar → `saveWorkoutSession()` persiste en IndexedDB con `volumeKg` calculado

### Patrón de recarga de datos
`useHomeData` expone `reload()` que incrementa un `refreshKey` y fuerza un nuevo
`useEffect`. Llamarlo después de editar o borrar una sesión desde el Home para
actualizar `recentSessions` sin recargar la página.

En Historial, la recarga es manual: `getAllSessions().then(s => setAllSessions([...s].reverse()))`.

### Notificaciones sin backend
1. Al abrir la app o volver a la pestaña (`visibilitychange`), se chequea si corresponde un recordatorio
2. Si el permiso está dado → notificación nativa
3. Si el permiso está denegado → banner in-app colapsable

### PWA y Service Worker
El Service Worker solo funciona en HTTPS o localhost.
Estrategia Workbox:
- `CacheFirst` para GIFs (`/exercises/*.gif`) y assets Vite (con hash en el nombre)
- `NetworkFirst` para el resto, con timeout de 5 segundos

### Fix importante: overflow en modales a pantalla completa
Los modales que ocupan `fixed inset-0 flex flex-col` necesitan `min-h-0` en el
área scrolleable para que el scroll funcione correctamente en iOS Safari:
```jsx
<div className="flex-1 min-h-0 overflow-y-auto ...">
```
Sin `min-h-0`, los flex items tienen `min-height: auto` por defecto, lo que impide
que el contenedor establezca correctamente su contexto de scroll.

También: nunca usar `overflow-hidden` en un card que está dentro de un flex
container scrolleable — puede recortar el contenido en lugar de dejarlo crecer.

---

## Qué intentamos y no funcionó

### `overflow-hidden` en cards dentro de modales scrolleables
Usamos `overflow-hidden` en los cards de ejercicio dentro de `ModalDetalleSesion`
para redondear esquinas. El resultado fue que solo se mostraba la primera serie de
cada ejercicio — el `overflow: hidden` recortaba el contenido en la interacción
con el flex container padre. Fix: usar `rounded-t-xl` / `rounded-b-xl` explícitos
en cada sección del card sin `overflow-hidden`.

### `flex-1` en inputs dentro de flex rows
El input de reps en `ModalEditarSesion` tenía `flex-1` además de `w-14`.
`flex-1` prevalece y lo estira a todo el ancho disponible, rompiendo el layout
cuando hay múltiples ejercicios expandidos. Fix: usar `shrink-0` en su lugar.

### Service Worker en red local (HTTP)
Intentamos servir la PWA desde la IP de la red local. El SW nunca se registró
porque iOS Safari requiere HTTPS. Solución: Vercel.

### Autocompletado por día (`getLastSessionByDay`)
La primera implementación buscaba la última sesión del mismo `dayIndex`. Si el
usuario había hecho el Día 1 hace 3 semanas y el Día 2 ayer, al iniciar Día 1
veía datos de hace 3 semanas. Fix: `buildLastDataMap` busca por `exerciseId`
específico en todas las sesiones, independientemente del día.

---

## Contexto importante para sesiones futuras

### `workoutPlan.js` y `homeExercises.js` están deprecados pero no eliminados
Estos archivos todavía existen y tienen los datos hardcodeados originales. No
eliminarlos aún — podrían tener referencias legacy. La fuente de verdad ahora es
`ejercicios.json` + `rutinaService.js`. Si en algún momento se quiere limpiar,
verificar primero que ningún componente los importe todavía.

### El perfil no tiene campo `name`
El onboarding pide edad, peso y altura. No hay nombre de usuario. El Home saluda
con "Hola 👋" genérico. Para agregar el nombre: campo en el formulario del
onboarding, campo en el modelo `profile.js`, leer `profile.name` en `Home.jsx`.

### El score de consistencia está preparado para nutrición y sueño
En `consistencyService.js` hay un TODO indicando dónde integrar los futuros
módulos. Actualmente el score máximo es 100. La propuesta futura divide en 3
módulos (gym, nutrición, sueño) de ~33 pts cada uno.

### ExerciseSelector solo muestra ejercicios con historial
Si el usuario recién instala la app y no tiene sesiones registradas, el selector
de ejercicios en Historial → tab Ejercicios aparece vacío. Es el comportamiento
correcto — se va poblando a medida que registra sesiones.

### Ejercicios en Historial → tab Ejercicios
`ExerciseSelector` resuelve los ejercicios del historial via `resolverEjercicio()`.
Ejercicios de casa también aparecen si el usuario los registró. No hay distinción
entre gym y casa en el selector.

### Rotación de variantes
`ROTATION_VARIANTS` en `analyticsService.js` mapea el exerciseId actual al ID
del ejercicio sugerido como variante. Solo define la sugerencia como texto; la
implementación de "elegir la variante directamente" queda para el futuro.

---

## Próximas features planeadas

| Feature | Descripción |
|---|---|
| **Nutrición** | Tracking diario: 115g proteína, superávit +300 kcal. Suma al score de consistencia. |
| **Sueño** | Tracking diario: 7.5–8hs, 1hs sin pantallas. Correlación con rendimiento. |
| **Nombre de usuario** | Campo `name` en el perfil para personalizar el saludo del Home. |
| **Variantes de ejercicios** | Elegir directamente la variante sugerida en la alerta de rotación. |
| **Capacitor** | Compilar como app nativa iOS/Android para distribución sin Safari. |
| **Backend Supabase** | Sync entre dispositivos. Offline-first con sync en background. |

---

## Preferencias de trabajo con Claude

- Explicar en español rioplatense, en pasos cortos, antes de ejecutar
- Pedir confirmación antes de crear o modificar archivos
- Enfoque didáctico: explicar el "por qué" de cada decisión
- No agregar funcionalidades no pedidas
- No agregar comentarios obvios en el código
