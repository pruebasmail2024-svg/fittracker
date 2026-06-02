export default function StagnationAlert({ exerciseName }) {
  return (
    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3
                    flex gap-3 items-start">
      <span className="text-xl shrink-0">⚠️</span>
      <p className="text-sm text-amber-300 leading-relaxed">
        <span className="font-semibold">Estancamiento detectado en {exerciseName}.</span>
        {' '}Intentá subir 1 repetición o revisá tu descanso y nutrición.
      </p>
    </div>
  )
}
