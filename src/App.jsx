import { useState, useEffect }   from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth }  from './contexts/AuthContext'
import { useProfile }             from './hooks/useProfile'
import { addWeightLog }           from './services/weightService'
import AppShell              from './layout/AppShell'
import Onboarding            from './views/Onboarding'
import Home                  from './views/Home'
import Entrenar              from './views/Entrenar'
import HomeWorkout           from './views/HomeWorkout'
import Historial             from './views/Historial'
import Longevidad            from './views/Longevidad'
import EnRadar               from './views/EnRadar'
import Configuracion         from './views/Configuracion'
import ProactiveWeightModal  from './components/ProactiveWeightModal'
import Auth                  from './views/Auth'
import MigrationModal        from './components/MigrationModal'
import { hasLegacyData }     from './services/migrationService'

function AppRoutes() {
  const { user }                          = useAuth()
  const { profile, loading, saveProfile } = useProfile()
  const [showMigration, setShowMigration] = useState(false)
  const [migrationChecked, setMigrationChecked] = useState(false)

  // Chequear datos legacy una sola vez al estar autenticado
  useEffect(() => {
    if (!user) return
    hasLegacyData().then(has => {
      setShowMigration(has)
      setMigrationChecked(true)
    })
  }, [user])

  // Usuario no autenticado → solo pantalla de login/registro
  if (!user) return <Auth />

  // Esperando chequeo de migración o carga de perfil
  if (!migrationChecked || loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-slate-950">
        <span className="text-slate-600 text-sm">Cargando…</span>
      </div>
    )
  }

  // Hay datos legacy → mostrar modal de migración
  if (showMigration) {
    return <MigrationModal onDone={() => setShowMigration(false)} />
  }

  // Autenticado pero sin perfil → onboarding
  if (!profile) {
    async function handleOnboardingComplete(formData) {
      await saveProfile(formData)
      await addWeightLog(user.id, { weightKg: formData.weightKg })
    }
    return (
      <div className="max-w-lg mx-auto h-dvh bg-slate-950 overflow-y-auto px-4">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  // Autenticado + con perfil → app completa
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/entrenar"      element={<Entrenar />} />
          <Route path="/entrenar-casa" element={<HomeWorkout />} />
          <Route path="/historial"     element={<Historial />} />
          <Route path="/longevidad"    element={<Longevidad />} />
          <Route path="/en-radar"      element={<EnRadar />} />
          <Route path="/config"        element={<Configuracion />} />
        </Routes>
      </AppShell>
      <ProactiveWeightModal />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
