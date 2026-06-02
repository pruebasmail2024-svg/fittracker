const CONTENT = {
  workout: {
    icon:  '🏋️',
    title: '¡Hoy toca entrenar!',
    body:  'Tu sesión de 40 minutos te espera. Activá las notificaciones para recibir recordatorios automáticos.',
  },
  weight: {
    icon:  '⚖️',
    title: 'Registro quincenal pendiente',
    body:  'Actualizá tu peso para mantener tu curva de proyección al día.',
  },
}

export default function InAppReminderBanner({ type, onDismiss }) {
  const { icon, title, body } = CONTENT[type] ?? CONTENT.workout

  return (
    <div className="mx-3 mt-2 rounded-xl bg-brand-500/10 border border-brand-500/25
                    px-4 py-3 flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-300 leading-snug">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{body}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Cerrar"
        className="text-slate-600 active:text-slate-300 text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
