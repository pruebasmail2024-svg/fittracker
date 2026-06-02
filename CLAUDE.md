# Training & Longevity App

SPA personal de entrenamiento y longevidad, pensada para usar en el gimnasio desde el celular.

## Stack

- **React 18** + **Vite 5** — bundler ultrarrápido, HMR instantáneo
- **Tailwind CSS 3** — utility-first, dark mode via clase `dark` en `<html>`
- **React Router v6** — navegación client-side entre vistas
- **idb** — wrapper moderno de IndexedDB para persistencia local (elegido sobre LocalStorage por capacidad ilimitada y soporte de objetos nativos)

## Estructura de carpetas

```
src/
├── components/   # Componentes reutilizables (botones, cards, modales)
├── hooks/        # Custom hooks (estado compartido, lógica de UI)
├── services/     # Capa de datos: IndexedDB via idb
├── models/       # Esquemas/tipos de datos (sesión, ejercicio, métrica)
├── views/        # Las 5 vistas/páginas principales
├── layout/       # AppShell: header + nav inferior + contenedor principal
└── utils/        # Helpers puros (fechas, formateo de números)
```

## Vistas (rutas)

| Vista         | Ruta          | Descripción                              |
|---------------|---------------|------------------------------------------|
| Entrenar      | `/`           | Sesión activa de entrenamiento           |
| Historial     | `/historial`  | Registro de sesiones pasadas             |
| Longevidad    | `/longevidad` | Métricas de salud a largo plazo          |
| En Radar      | `/en-radar`   | Nutrición y sueño                        |
| Configuración | `/config`     | Preferencias de usuario                  |

## Decisiones de diseño

- **Modo oscuro por defecto**: clase `dark` hardcodeada en `<html>` en `index.html`
- **Mobile-first**: layout máximo `max-w-lg`, navegación en barra inferior (thumb-friendly)
- **Sin backend**: toda la persistencia es local (IndexedDB). Sin auth, sin servidor.
- **Color brand**: verde (`brand-400` = `#4ade80`) — energía y salud

## Preferencias de trabajo con Claude

- Explicar en español rioplatense, en pasos cortos, antes de ejecutar
- Pedir confirmación antes de crear o modificar archivos
- Enfoque didáctico: explicar el "por qué" de cada decisión
- No agregar funcionalidades no pedidas
- No agregar comentarios obvios en el código

## Cómo correr la app

```bash
npm install
npm run dev
```

Abre http://localhost:5173 en el navegador.
