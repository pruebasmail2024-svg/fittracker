export default function ErrorBanner({ onRetry }) {
  return (
    <div className="mx-4 mt-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3
                    flex items-center justify-between gap-3">
      <p className="text-xs text-red-400 leading-relaxed">
        Sin conexión o error del servidor. Intentá de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="text-xs font-semibold text-red-400 border border-red-500/40 rounded-lg
                   px-3 py-1.5 shrink-0 active:bg-red-500/20 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
