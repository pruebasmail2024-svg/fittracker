import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useProfile } from './hooks/useProfile'
import { addWeightLog } from './services/weightService'
import { createWeightLog } from './models/weightLog'
import AppShell              from './layout/AppShell'
import Onboarding            from './views/Onboarding'
import Home                  from './views/Home'
import Entrenar              from './views/Entrenar'
import Historial             from './views/Historial'
import Longevidad            from './views/Longevidad'
import EnRadar               from './views/EnRadar'
import Configuracion         from './views/Configuracion'
import ProactiveWeightModal  from './components/ProactiveWeightModal'

export default function App() {
  const { profile, loading, saveProfile } = useProfile()

  // Mientras IndexedDB responde, evitamos el flash de onboarding
  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-slate-950">
        <span className="text-slate-600 text-sm">Cargando…</span>
      </div>
    )
  }

  // Sin perfil → onboarding
  if (!profile) {
    async function handleOnboardingComplete(formData) {
      await saveProfile(formData)
      // El peso del onboarding es el primer registro del historial
      await addWeightLog(createWeightLog({ weightKg: formData.weightKg }))
    }
    return (
      <div className="max-w-lg mx-auto h-dvh bg-slate-950 overflow-y-auto px-4">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  // Con perfil → app completa
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/entrenar"   element={<Entrenar />} />
          <Route path="/historial"  element={<Historial />} />
          <Route path="/longevidad" element={<Longevidad />} />
          <Route path="/en-radar"   element={<EnRadar />} />
          <Route path="/config"     element={<Configuracion />} />
        </Routes>
      </AppShell>
      {/* Modal proactivo: se muestra si pasaron >15 días sin registrar peso */}
      <ProactiveWeightModal />
    </BrowserRouter>
  )
}
