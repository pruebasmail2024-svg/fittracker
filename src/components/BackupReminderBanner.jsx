export default function BackupReminderBanner({ onDownload, onSnooze }) {
  return (
    <div className="mx-3 mt-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25
                    px-4 py-3 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">💾</span>
        <p className="text-sm text-indigo-300 leading-relaxed">
          Hace más de 30 días que no descargás tu historial. Guardá un backup
          para no perder tu progreso.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDownload}
          className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-xs font-semibold
                     text-white active:bg-indigo-600 transition-colors"
        >
          Descargar ahora
        </button>
        <button
          onClick={onSnooze}
          className="flex-1 rounded-xl border border-indigo-500/30 py-2.5 text-xs
                     font-medium text-indigo-400 active:bg-indigo-500/10 transition-colors"
        >
          Recordarme en 7 días
        </button>
      </div>
    </div>
  )
}
