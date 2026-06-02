const STYLES = {
  green:  'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  yellow: 'bg-amber-500/15  border-amber-500/30  text-amber-400',
  red:    'bg-red-500/15    border-red-500/30    text-red-400',
}

export default function WeightStatusBadge({ label, color }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1
                      text-xs font-semibold ${STYLES[color]}`}>
      {label}
    </span>
  )
}
