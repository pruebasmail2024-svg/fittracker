import { useState } from 'react'

const TABS = ['Nutrición', 'Sueño']

// ─── Componentes compartidos ──────────────────────────────────────────────────

function GoalRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/50
                    last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-200">{value}</span>
    </div>
  )
}

function ComingSoonBanner({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 px-5 py-6
                    flex flex-col items-center gap-3 text-center">
      <span className="text-3xl">🚧</span>
      <div>
        <p className="text-sm font-semibold text-slate-400">{title}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── Tab Nutrición ────────────────────────────────────────────────────────────

function NutricionTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metas actuales */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-2">
          Tus metas diarias
        </h3>
        <GoalRow icon="🥩" label="Proteínas diarias"   value="115 g" />
        <GoalRow icon="🔥" label="Superávit calórico"  value="+300 kcal" />
      </div>

      {/* Banner próximamente */}
      <ComingSoonBanner
        title="Próximamente — Tracking de Nutrición"
        description={
          'Podrás registrar tus comidas, ver el balance proteico del día, ' +
          'seguir tu superávit calórico semanal y recibir alertas cuando ' +
          'estés por debajo de tus metas de construcción muscular.'
        }
      />

      {/* Tip estático mientras tanto */}
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          💡 Tip mientras tanto
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          Para alcanzar 115g de proteína diaria: 200g de pollo (46g) +
          3 huevos (18g) + 1 taza de legumbres (15g) + 1 scoop de proteína (25g)
          = ~104g. Completá con queso cottage o yogur griego.
        </p>
      </div>
    </div>
  )
}

// ─── Tab Sueño ────────────────────────────────────────────────────────────────

function SuenoTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metas actuales */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-2">
          Tus metas diarias
        </h3>
        <GoalRow icon="😴" label="Horas de sueño"        value="7.5 – 8 hs" />
        <GoalRow icon="📵" label="Sin pantallas antes"   value="1 hs antes" />
      </div>

      {/* Banner próximamente */}
      <ComingSoonBanner
        title="Próximamente — Tracking de Sueño"
        description={
          'Podrás registrar la hora de acostarte y levantarte, ver tu ' +
          'promedio semanal de horas de sueño, seguir tu adherencia a la ' +
          'rutina sin pantallas y correlacionar la calidad de sueño con ' +
          'tu rendimiento en el gym.'
        }
      />

      {/* Tip estático mientras tanto */}
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          💡 Tip mientras tanto
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          El 80% de la síntesis proteica ocurre durante el sueño profundo.
          Mantener un horario fijo de acostarte (±30 min) mejora la calidad
          más que la cantidad de horas.
        </p>
      </div>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function EnRadar() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100">En Radar</h1>
        <p className="text-sm text-slate-400 mt-1">Nutrición y sueño</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-800 p-1 gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === i
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-500 active:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <NutricionTab />}
      {activeTab === 1 && <SuenoTab />}
    </div>
  )
}
