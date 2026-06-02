import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import Entrenar    from './views/Entrenar'
import Historial   from './views/Historial'
import Longevidad  from './views/Longevidad'
import EnRadar     from './views/EnRadar'
import Configuracion from './views/Configuracion'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"           element={<Entrenar />} />
          <Route path="/historial"  element={<Historial />} />
          <Route path="/longevidad" element={<Longevidad />} />
          <Route path="/en-radar"   element={<EnRadar />} />
          <Route path="/config"     element={<Configuracion />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
