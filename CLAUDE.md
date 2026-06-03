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

Los usuarios en el celular reciben la nueva versión la próxima vez que abren la app.

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
├── components/        # Componentes reutilizables
├── data/
│   ├── workoutPlan.js      # Rutina de gym de 3 días (estática, 12 ejercicios)
│   └── homeExercises.js    # Catálogo de ejercicios en casa (8 ejercicios)
├── hooks/             # Custom hooks de React
├── layout/
│   └── AppShell.jsx        # Header + nav inferior (6 tabs) + banners
├── models/            # Factories de objetos para IndexedDB
│   ├── profile.js
│   ├── weightLog.js
│   └── workoutSession.js   # sessionType: 'gym'|'home_replacement'|'home_extra'
├── services/          # Capa de datos (IndexedDB + localStorage)
│   ├── analyticsService.js  # detectStagnation, generateWeightProjection, ROTATION_VARIANTS
│   ├── consistencyService.js
│   ├── db.js               # openDB con 5 stores
│   ├── exportService.js
│   ├── importService.js
│   ├── notificationService.js
│   ├── profileService.js
│   ├── weightService.js
│   └── workoutService.js
├── utils/
│   ├── date.js             # Formateo de fechas en es-AR
│   └── format.js           # formatDuration, formatVolume
└── views/
    ├── Configuracion.jsx
    ├── EnRadar.jsx
    ├── Entrenar.jsx
    ├── Historial.jsx
    ├── Home.jsx
    ├── HomeWorkout.jsx     # Sesión de entrenamiento en casa
    ├── Longevidad.jsx
    └── Onboarding.jsx
```

---

## Vistas (rutas)

| Vista | Ruta | Descripción |
|---|---|---|
| Home | `/` | Dashboard: próxima sesión, métricas, alertas, racha |
| Entrenar | `/entrenar` | Sesión de gym con GIFs, sets, cronómetros |
| Entrenar en Casa | `/entrenar-casa` | Sesión libre con catálogo de ejercicios en casa |
| Historial | `/historial` | Peso vs proyección + evolución por ejercicio + lista de sesiones |
| Longevidad | `/longevidad` | Score de consistencia semanal + seguimiento de peso |
| En Radar | `/en-radar` | Placeholders nutrición y sueño (próximamente) |
| Configuración | `/config` | Notificaciones + Mis Datos (export/import) |

---

## Funcionalidades del MVP

### Entrenamiento de gym
- Rutina precargada de 3 días full-body con superseries antagónicas (12 ejercicios)
- GIF demostrativo + descripción técnica + error común por ejercicio
- Autocomplete de peso/reps desde la última sesión del mismo ejercicio
- Sobrecarga progresiva: referencia visible de la sesión anterior
- Cronómetro de descanso entre series (45s) con beep y vibración
- Cronómetro ascendente de duración de sesión (MM:SS)
- Resumen de sesión: series, volumen total (kg×reps) y duración
- Alerta de estancamiento: 3 sesiones consecutivas sin progreso en un ejercicio

### Entrenamiento en casa
- Catálogo de 8 ejercicios en 2 categorías (peso corporal + mancuernas)
- GIFs donde existen, placeholders elegantes donde no
- Sesión libre: el usuario elige y ordena los ejercicios
- Puede agregar el mismo ejercicio varias veces (instancias independientes)
- Dos modos: "Reemplaza gym" (cuenta para el score) o "Complemento extra" (no cuenta)
- Sobrecarga progresiva: referencia de la última vez que hizo ese ejercicio

### Peso corporal
- Registro quincenal con historial cronológico inmutable
- Curva de proyección hardgainer (mes 1: +2kg, mes 2: +1kg, mes 3: +1kg, +0.5kg/mes)
- Gráfico dual: peso real vs proyección ideal
- Indicador de estado: verde/amarillo/rojo según días desde el último registro
- Modal proactivo si pasaron >15 días sin registrar
- Alerta quincenal de rotación de variantes (cada 120 días)

### Analytics
- Score de consistencia semanal (0–100): 33pts por entreno + 1pt peso al día
- Sesiones en casa "reemplazo" cuentan igual que gym; "complemento" no cuentan
- Tendencia de 4 semanas con barras visuales
- Racha de semanas consecutivas con 3 entrenos (solo semanas completas)
- Evolución de peso máximo, reps y volumen por ejercicio (gráficos con toggle)
- Detección de mejor progreso entre sesiones del mismo día

### Notificaciones
- Recordatorios de entrenamiento: días y hora configurables, disparo via `visibilitychange`
- Alerta quincenal de peso (nativa o banner in-app)
- Alerta de backup cada 30 días
- Fallback in-app cuando el permiso está denegado (banner colapsable)

### Datos y backup
- Export: ZIP con 3 CSVs (peso, entrenamientos con tipo_sesion, consistencia semanal)
- Import: restauración completa desde ZIP con preview y confirmación
- Banner de recordatorio si pasaron >30 días sin backup
- Aviso de almacenamiento local en el onboarding

### PWA
- Instalable en iOS (Safari) y Android (Chrome)
- Service Worker con Workbox: CacheFirst para GIFs y assets, NetworkFirst para resto
- Funciona offline después de la primera carga (requiere HTTPS — usar Vercel)

---

## Arquitectura y decisiones de diseño

### Persistencia: IndexedDB vía `idb`
Se eligió IndexedDB sobre localStorage porque:
- Soporta objetos nativos sin serialización
- Capacidad de GBs vs ~5MB de localStorage
- Asíncrono — no bloquea la UI
- Índices para queries eficientes (ej: `by_date` en `weightLogs`)

**5 stores en `db.js` (versión 1):**
- `profile` — un solo registro, keyPath `id = 'me'`
- `weightLogs` — historial inmutable, índice `by_date`
- `workoutSessions` — gym + casa, índice `by_date`
- `nutritionLogs` — vacío, reservado para futuro
- `sleepLogs` — vacío, reservado para futuro

**localStorage** se usa solo para preferencias ligeras que no son datos del usuario:
- Configuración de notificaciones
- Fechas de snooze de banners
- Fecha del último backup

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

Los componentes nunca llaman a servicios directamente — siempre via hooks. Los servicios son funciones async puras sin estado de React.

### Patrón de hooks compartidos
Hooks como `useWeightLogs`, `useProfile` y `useWeightStatus` son llamados en múltiples componentes independientemente. Cada instancia hace su propia consulta a IndexedDB. Esto es aceptable dado el volumen de datos (cientos de registros, no millones). Si se necesita optimizar: usar React Context o una librería de estado global.

### Modelo de sesión unificado gym + casa
`workoutSession` tiene un campo `sessionType`:
- `'gym'` (default) — sesión de gym normal
- `'home_replacement'` — sesión en casa que reemplaza gym, tiene `dayIndex`
- `'home_extra'` — sesión en casa complementaria, `dayIndex = null`

La consistencyService excluye `home_extra` del conteo. Todas las demás sesiones (gym + home_replacement) cuentan hacia el máximo de 3 por semana.

### Identificadores de ejercicios
- Ejercicios de gym: IDs cortos como `'squat'`, `'bench-press'`
- Ejercicios en casa: prefijo `'home_'` → `'home_pushup'`, `'home_dumbbell_curl'`
- El historial unificado (`useExerciseHistory`) busca por `exerciseId` en todas las sesiones. Funciona automáticamente para gym y casa.

### Notificaciones sin backend
Las Web Notifications solo funcionan cuando el navegador está abierto. Sin un servidor Push, no es posible despertar al navegador. La estrategia implementada:
1. Al abrir la app o volver a la pestaña (`visibilitychange`), se chequea si corresponde un recordatorio
2. Si el permiso está dado → notificación nativa
3. Si el permiso está denegado → banner in-app colapsable

Los banners de recordatorio (entrenamiento, peso, backup) usan fechas en localStorage para no repetirse el mismo día.

### PWA y Service Worker
El Service Worker solo funciona en HTTPS o localhost. Desde la red local (`http://192.168.x.x`) el SW no se registra y el offline no funciona. La solución es deployar en Vercel (HTTPS automático).

Estrategia Workbox:
- `CacheFirst` para GIFs (`/exercises/*.gif`) y assets Vite (con hash en el nombre)
- `NetworkFirst` para el resto, con timeout de 5 segundos

### Cronómetro de sesión
El timer ascendente usa `Date.now()` como referencia absoluta (no un contador de segundos). Se calcula: `Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)` en cada tick. Esto evita deriva acumulada y funciona correctamente si la pantalla se bloquea o la app va a segundo plano.

La duración final se calcula igual al guardar: `Date.now() - new Date(startedAt)`. No hay estado de "tiempo corriendo" — solo el timestamp de inicio.

---

## Qué intentamos y no funcionó

### `npm create vite@latest .` en directorio con `.git`
El comando cancela interactivamente si detecta archivos en el directorio. Se resolvió creando los archivos del proyecto manualmente en lugar de usar el scaffolding automático.

### Service Worker en red local (HTTP)
Intentamos servir la PWA desde la IP de la red local para que el usuario la instalara en el iPhone. Funcionó visualmente (la app cargaba) pero el Service Worker nunca se registró porque iOS Safari requiere HTTPS. Resultado: la app abría en casa pero quedaba en blanco afuera. Solución: Vercel.

### Autocompletado por día (`getLastSessionByDay`)
La primera implementación del autocompletado de peso/reps buscaba la última sesión del mismo `dayIndex`. Problema: si el usuario hacía el Día 1 hace 3 semanas y el Día 2 ayer, al iniciar Día 1 veía datos de hace 3 semanas. Se reemplazó con `buildLastDataMap` que busca la última sesión que contenga cada `exerciseId` específico, independientemente del día.

### Múltiples instancias de `useWeightLogs` / `useProfile`
Varios componentes llaman a los mismos hooks. Al principio generaba preocupación de performance por múltiples lecturas de IndexedDB. En la práctica, con el volumen de datos actual, no hay problema perceptible. Si en el futuro se vuelve un cuello de botella, la solución es un Context Provider que centralice las lecturas.

---

## Contexto importante para sesiones futuras

### El selector de ejercicio en casa no incluye todos los ejercicios de gym
`ExerciseSelector` (Historial → tab Ejercicios) usa `ALL_EXERCISES` de `workoutPlan.js`. Los ejercicios de casa están en `ALL_HOME_EXERCISES` de `homeExercises.js`. Si se quiere ver la evolución de ejercicios en casa desde Historial, hay que actualizar `ExerciseSelector` para incluir ambos.

### El perfil no tiene campo `name`
El onboarding pide edad, peso y altura. No hay nombre. El Home saluda con "Hola 👋" genérico. Agregar el nombre requiere: campo en el formulario del onboarding, campo en el modelo `profile.js`, y leer `profile.name` en `Home.jsx`.

### El score de consistencia está preparado para nutrición y sueño
En `consistencyService.js` hay un comentario TODO que indica dónde integrar los futuros módulos. Actualmente el score máximo es 100 (99 por entrenos + 1 por peso). La propuesta futura es dividir en 3 módulos: gym, nutrición, sueño → cada uno aporta hasta ~33 pts.

### Las sesiones antiguas no tienen `sessionType`
Las sesiones guardadas antes de agregar el campo `sessionType` no lo tienen. El código siempre usa `s.sessionType ?? 'gym'` para el fallback. No hay migración necesaria.

### Volumen en ejercicios de peso corporal
Las flexiones y sentadillas se guardan con `weightKg: 0`. El volumen calculado (0 × reps = 0) es correcto pero no muy útil. En el futuro se podría usar el peso corporal del perfil para estimar el volumen real de estos ejercicios.

### Los GIFs de gym reutilizados en ejercicios en casa
`bicep-curl.gif`, `overhead-press.gif` y `barbell-row.gif` se muestran tanto en la sesión de gym como en la sesión en casa (Arnold Press y Remo con Mancuerna). Son aproximaciones visuales aceptables para el MVP.

---

## Próximas features planeadas

| Feature | Descripción |
|---|---|
| **Nutrición** | Tracking diario: 115g proteína, superávit +300 kcal. El módulo sumará al score de consistencia. |
| **Sueño** | Tracking diario: 7.5–8hs, 1hs sin pantallas. Correlación con rendimiento en gym. |
| **Capacitor** | Compilar como app nativa iOS/Android para distribución sin Safari. |
| **Backend Supabase** | Sync entre dispositivos con Supabase Auth + PostgreSQL. Mantiene el modelo offline-first con sync en background. |
| **Nombre de usuario** | Campo `name` en el perfil para personalizar el saludo del Home. |
| **Variantes de ejercicios** | Permitir elegir la variante sugerida en la alerta de rotación. |
| **ExerciseSelector unificado** | Incluir ejercicios en casa en el selector del Historial. |

---

## Preferencias de trabajo con Claude

- Explicar en español rioplatense, en pasos cortos, antes de ejecutar
- Pedir confirmación antes de crear o modificar archivos
- Enfoque didáctico: explicar el "por qué" de cada decisión
- No agregar funcionalidades no pedidas
- No agregar comentarios obvios en el código
