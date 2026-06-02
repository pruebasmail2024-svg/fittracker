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

---

## Cómo instalarla como PWA en iOS (Safari)

1. Abrí la app en Safari desde tu iPhone
2. Navegá un poco para que el Service Worker cachee los assets
3. Tocá el botón de **compartir** (ícono de cuadrado con flecha ↑)
4. Deslizá y tocá **"Agregar a pantalla de inicio"**
5. El nombre aparece como "FitTracker" — tocá **Agregar**

Una vez instalada funciona **sin conexión** — todos los assets y GIFs están
cacheados por el Service Worker.

> Requiere iOS 16.4+ para soporte completo de PWA.

---

## Estructura de carpetas

```
src/
├── components/        # Componentes reutilizables
│   ├── BackupReminderBanner.jsx
│   ├── BodyWeightChart.jsx
│   ├── DayPicker.jsx
│   ├── ExerciseCard.jsx
│   ├── ExerciseHistoryChart.jsx
│   ├── ExerciseHistoryTable.jsx
│   ├── ExerciseInlineChart.jsx
│   ├── ExerciseSelector.jsx
│   ├── InAppReminderBanner.jsx
│   ├── ProactiveWeightModal.jsx
│   ├── RestTimer.jsx
│   ├── RotationAlert.jsx
│   ├── SessionSummary.jsx
│   ├── SetLogger.jsx
│   ├── StagnationAlert.jsx
│   ├── WeightLogModal.jsx
│   └── WeightStatusBadge.jsx
├── data/
│   └── workoutPlan.js     # Rutina de 3 días (estática)
├── hooks/                 # Custom hooks de React
│   ├── useBodyWeightChart.js
│   ├── useConsistencyScore.js
│   ├── useExerciseHistory.js
│   ├── useHomeData.js
│   ├── useNotifications.js
│   ├── useProfile.js
│   ├── useRestTimer.js
│   ├── useStagnationAlerts.js
│   ├── useWeightLogs.js
│   ├── useWeightStatus.js
│   └── useWorkoutSession.js
├── layout/
│   └── AppShell.jsx       # Header + nav inferior + banners
├── models/                # Factories de objetos para IndexedDB
│   ├── profile.js
│   ├── weightLog.js
│   └── workoutSession.js
├── services/              # Capa de datos (IndexedDB + localStorage)
│   ├── analyticsService.js
│   ├── consistencyService.js
│   ├── db.js
│   ├── exportService.js
│   ├── importService.js
│   ├── notificationService.js
│   ├── profileService.js
│   ├── weightService.js
│   └── workoutService.js
├── utils/
│   ├── date.js            # Formateo de fechas en es-AR
│   └── format.js          # formatDuration, formatVolume
└── views/                 # Vistas / páginas
    ├── Configuracion.jsx
    ├── EnRadar.jsx
    ├── Entrenar.jsx
    ├── Historial.jsx
    ├── Home.jsx
    ├── Longevidad.jsx
    └── Onboarding.jsx
```

---

## Vistas (rutas)

| Vista | Ruta | Descripción |
|---|---|---|
| Home | `/` | Dashboard principal: próxima sesión, métricas, alertas |
| Entrenar | `/entrenar` | Ejecución de sesión con GIFs, sets, cronómetros |
| Historial | `/historial` | Peso corporal vs proyección + evolución por ejercicio |
| Longevidad | `/longevidad` | Score de consistencia semanal + seguimiento de peso |
| En Radar | `/en-radar` | Placeholders nutrición y sueño (próximamente) |
| Configuración | `/config` | Notificaciones + Mis Datos (export/import) |

---

## Funcionalidades del MVP

### Entrenamiento
- Rutina precargada de 3 días full-body con superseries antagónicas (12 ejercicios)
- GIF demostrativo + descripción técnica + error común por ejercicio
- Autocomplete de peso/reps desde la última sesión del mismo ejercicio
- Sobrecarga progresiva: referencia visible de la sesión anterior
- Cronómetro de descanso entre series (45s) con beep y vibración
- Cronómetro ascendente de duración de sesión (MM:SS)
- Resumen de sesión: series, volumen total (kg×reps) y duración
- Alerta de estancamiento: 3 sesiones consecutivas sin progreso en un ejercicio

### Peso corporal
- Registro quincenal con historial cronológico inmutable
- Curva de proyección hardgainer (mes 1: +2kg, mes 2: +1kg, mes 3: +1kg, +0.5kg/mes)
- Gráfico dual: peso real vs proyección ideal
- Indicador de estado: verde/amarillo/rojo según días desde el último registro
- Modal proactivo si pasaron >15 días sin registrar
- Alerta quincenal de rotación de variantes (cada 120 días)

### Analytics
- Score de consistencia semanal (0–100): 33pts por entreno + 1pt peso al día
- Tendencia de 4 semanas
- Racha de semanas consecutivas con 3 entrenos
- Evolución de peso máximo, reps y volumen por ejercicio (gráficos con toggle)
- Detección de mejor progreso entre sesiones del mismo día

### Notificaciones
- Recordatorios de entrenamiento: días y hora configurables, disparo via `visibilitychange`
- Alerta quincenal de peso (nativa o banner in-app)
- Alerta de backup cada 30 días
- Fallback in-app cuando el permiso está denegado (banner colapsable)

### Datos y backup
- Export: ZIP con 3 CSVs (peso, entrenamientos, consistencia semanal)
- Import: restauración completa desde ZIP con preview y confirmación
- Banner de recordatorio si pasaron >30 días sin backup
- Aviso de almacenamiento local en el onboarding

### PWA
- Instalable en iOS (Safari) y Android (Chrome)
- Service Worker con Workbox: CacheFirst para GIFs y assets, NetworkFirst para resto
- Funciona offline después de la primera carga

---

## Decisiones de diseño

- **Modo oscuro por defecto**: clase `dark` hardcodeada en `<html>` — sin flash blanco al cargar
- **Mobile-first**: max-width `max-w-lg`, navegación en barra inferior (thumb-friendly)
- **Sin backend**: toda la persistencia en IndexedDB. Sin auth, sin servidor.
- **Color brand**: verde (`brand-400` = `#4ade80`) — energía y salud
- **Fondo base**: `#0f172a` (slate-950)

---

## Próximas features planeadas

| Feature | Descripción |
|---|---|
| **Nutrición** | Tracking diario: 115g proteína, superávit +300 kcal. El módulo sumará al score de consistencia. |
| **Sueño** | Tracking diario: 7.5–8hs, 1hs sin pantallas. Correlación con rendimiento en gym. |
| **Capacitor** | Compilar como app nativa iOS/Android para distribución sin Safari. |
| **Backend Supabase** | Sync entre dispositivos con Supabase Auth + PostgreSQL. Mantiene el modelo offline-first con sync en background. |
| **Nombre de usuario** | Agregar campo `name` al perfil para personalizar el saludo del Home. |
| **Variantes de ejercicios** | Permitir al usuario elegir la variante sugerida en la alerta de rotación. |

---

## Preferencias de trabajo con Claude

- Explicar en español rioplatense, en pasos cortos, antes de ejecutar
- Pedir confirmación antes de crear o modificar archivos
- Enfoque didáctico: explicar el "por qué" de cada decisión
- No agregar funcionalidades no pedidas
- No agregar comentarios obvios en el código
