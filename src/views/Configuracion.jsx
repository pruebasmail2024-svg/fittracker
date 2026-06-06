import { useState, useRef } from 'react'
import {
  getPermissionStatus,
  requestPermission,
  getSettings,
  saveSettings,
} from '../services/notificationService'
import { generateAndDownloadBackup } from '../services/exportService'
import { parseBackupZip, confirmImport } from '../services/importService'
import MiRutina from '../components/MiRutina'
import { useAuth } from '../contexts/AuthContext'

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
]

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6:00 → 23:00

const PERMISSION_UI = {
  granted:     { icon: '🟢', text: 'Concedido',  color: 'text-emerald-400' },
  denied:      { icon: '🔴', text: 'Denegado',   color: 'text-red-400'     },
  default:     { icon: '⚪', text: 'Sin definir', color: 'text-slate-400'  },
  unsupported: { icon: '⚫', text: 'No soportado', color: 'text-slate-500' },
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-4 py-4
                    flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-brand-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow
                    transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

function DeniedInstructions() {
  return (
    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3
                    flex flex-col gap-2">
      <p className="text-xs font-semibold text-red-400">
        Cómo habilitar manualmente:
      </p>
      <ol className="flex flex-col gap-1.5 text-xs text-slate-400 list-decimal list-inside">
        <li>Tocá el ícono de candado 🔒 en la barra de direcciones</li>
        <li>Buscá "Notificaciones" y cambialo a <strong className="text-slate-300">Permitir</strong></li>
        <li>Recargá la página</li>
      </ol>
      <p className="text-xs text-slate-600 mt-1">
        En iOS: Ajustes → Safari → Notificaciones → FitTracker → Permitir
      </p>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function Configuracion() {
  const { user, signOut }            = useAuth()
  const [permission, setPermission]  = useState(getPermissionStatus)
  const [settings, setSettings]      = useState(getSettings)
  const [signOutConfirm, setSignOutConfirm] = useState(false)

  // Estados para exportar / importar
  const [exportLoading, setExportLoading] = useState(false)
  const [exportMsg, setExportMsg]         = useState('')
  const [importPhase, setImportPhase]     = useState('idle') // idle|previewing|importing|done|error
  const [importPreview, setImportPreview] = useState(null)
  const [importData, setImportData]       = useState(null)
  const [importError, setImportError]     = useState('')
  const fileInputRef = useRef(null)

  const ui = PERMISSION_UI[permission] ?? PERMISSION_UI.default

  async function handleRequestPermission() {
    const result = await requestPermission()
    setPermission(result)
  }

  function updateSettings(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  async function handleExport() {
    setExportLoading(true)
    setExportMsg('')
    try {
      const { zipName } = await generateAndDownloadBackup()
      setExportMsg(`✓ Descargado: ${zipName}`)
    } catch (e) {
      setExportMsg(`Error al exportar: ${e.message}`)
    } finally {
      setExportLoading(false)
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''          // permite seleccionar el mismo archivo de nuevo
    setImportError('')
    try {
      const result = await parseBackupZip(file)
      setImportPreview(result.preview)
      setImportData(result.data)
      setImportPhase('previewing')
    } catch (err) {
      setImportError(err.message)
      setImportPhase('error')
    }
  }

  async function handleConfirmImport() {
    setImportPhase('importing')
    try {
      await confirmImport(importData)
      setImportPhase('done')
    } catch (err) {
      setImportError(err.message)
      setImportPhase('error')
    }
  }

  function resetImport() {
    setImportPhase('idle')
    setImportPreview(null)
    setImportData(null)
    setImportError('')
  }

  function toggleDay(day) {
    const days = settings.days.includes(day)
      ? settings.days.filter(d => d !== day)
      : [...settings.days, day]
    updateSettings({ days })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Preferencias de la app</p>
      </div>

      {/* ── Sección Notificaciones ── */}
      <SectionCard title="🔔 Notificaciones">

        {/* Estado del permiso */}
        <Row label="Estado del permiso">
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${ui.color}`}>
            {ui.icon} {ui.text}
          </span>
        </Row>

        {/* Botón activar / info unsupported */}
        {permission === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold
                       text-white active:bg-brand-600 transition-colors"
          >
            Activar Notificaciones
          </button>
        )}

        {permission === 'denied' && <DeniedInstructions />}

        {permission === 'unsupported' && (
          <p className="text-xs text-slate-500">
            Tu navegador no soporta notificaciones. Los recordatorios in-app
            seguirán funcionando.
          </p>
        )}

        {permission === 'granted' && (
          <p className="text-xs text-emerald-600">
            Las notificaciones están activas. La app te avisará cuando abras
            el navegador si corresponde un recordatorio.
          </p>
        )}
      </SectionCard>

      {/* ── Recordatorios de entrenamiento ── */}
      <SectionCard title="🏋️ Recordatorio de entrenamiento">

        <Row label="Activar recordatorios">
          <Toggle
            enabled={settings.enabled}
            onChange={enabled => updateSettings({ enabled })}
          />
        </Row>

        {settings.enabled && (
          <>
            {/* Días de la semana */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Días
              </span>
              <div className="flex gap-2">
                {WEEK_DAYS.map(({ value, label }) => {
                  const active = settings.days.includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => toggleDay(value)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                        active
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hora */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Hora
              </span>
              <select
                value={settings.hour}
                onChange={e => updateSettings({ hour: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-700 border border-slate-600 px-4 py-3
                           text-slate-100 text-sm focus:outline-none focus:border-brand-500
                           transition-colors"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              La notificación se dispara la primera vez que abrís la app en ese
              horario (±2 hs). Requiere que el navegador esté abierto.
            </p>
          </>
        )}
      </SectionCard>

      {/* ── Mi Rutina ── */}
      <SectionCard title="📋 Mi Rutina">
        <p className="text-xs text-slate-500 -mt-2">
          Personaliza los ejercicios de cada día. Tu historial no se pierde al cambiar.
        </p>
        <MiRutina />
      </SectionCard>

      {/* ── Mis Datos ── */}
      <SectionCard title="🗄️ Mis Datos">

        {/* A) Banner informativo fijo */}
        <div className="rounded-xl bg-slate-700/40 border border-slate-600/40 px-4 py-3
                        flex gap-3 items-start">
          <span className="text-base shrink-0 mt-0.5">ℹ️</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu información está guardada en el caché de este navegador. Si borrás
            el caché o cambiás de dispositivo, perderás tu historial.{' '}
            <span className="text-slate-300">Descargá tu información periódicamente como respaldo.</span>
          </p>
        </div>

        {/* B) Exportar */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Exportar historial
          </p>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="w-full rounded-xl bg-slate-700 border border-slate-600 py-3
                       text-sm font-semibold text-slate-200 active:bg-slate-600
                       transition-colors disabled:opacity-50"
          >
            {exportLoading ? 'Generando ZIP…' : '⬇️ Descargar mi historial'}
          </button>
          {exportMsg && (
            <p className={`text-xs text-center ${exportMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
              {exportMsg}
            </p>
          )}
          <p className="text-xs text-slate-600">
            Descarga un ZIP con 3 archivos CSV: peso corporal, entrenamientos y
            consistencia semanal.
          </p>
        </div>

        {/* C) Importar */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Restaurar desde backup
          </p>

          {/* idle */}
          {importPhase === 'idle' && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-slate-600 py-3
                           text-sm font-medium text-slate-400 active:bg-slate-800
                           transition-colors"
              >
                📂 Seleccionar archivo .zip
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}

          {/* previewing */}
          {importPhase === 'previewing' && importPreview && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-slate-700/50 border border-slate-600/50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Contenido del backup:
                </p>
                <ul className="text-sm text-slate-400 flex flex-col gap-1">
                  <li>⚖️ {importPreview.pesoCount} registros de peso</li>
                  <li>🏋️ {importPreview.sessionCount} sesiones de entrenamiento</li>
                  <li>📅 {importPreview.weeksCount} semanas de consistencia</li>
                </ul>
                <p className="text-xs text-amber-400 mt-3">
                  ⚠️ Esto reemplazará todos tus datos actuales.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmImport}
                  className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold
                             text-white active:bg-brand-600 transition-colors"
                >
                  Confirmar restauración
                </button>
                <button
                  onClick={resetImport}
                  className="flex-1 rounded-xl border border-slate-600 py-3 text-sm
                             text-slate-400 active:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* importing */}
          {importPhase === 'importing' && (
            <p className="text-sm text-slate-400 text-center py-2">Importando datos…</p>
          )}

          {/* done */}
          {importPhase === 'done' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-emerald-400 text-center">
                ✓ Historial restaurado correctamente.
              </p>
              <button onClick={resetImport} className="text-xs text-slate-600 text-center">
                Importar otro archivo
              </button>
            </div>
          )}

          {/* error */}
          {importPhase === 'error' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-red-400 leading-relaxed">{importError}</p>
              <button
                onClick={resetImport}
                className="text-xs text-slate-500 text-center active:text-slate-300"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Placeholder secciones futuras */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/30 px-4 py-4
                      flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-500">Próximamente</h2>
        <p className="text-xs text-slate-600">
          Tema de color · Unidades (kg/lb) · Borrar historial
        </p>
      </div>

      {/* ── Cuenta ── */}
      <SectionCard title="👤 Cuenta">
        <Row label="Email">
          <span className="text-sm text-slate-300 truncate max-w-[180px]">{user?.email}</span>
        </Row>

        {!signOutConfirm ? (
          <button
            onClick={() => setSignOutConfirm(true)}
            className="w-full rounded-xl border border-slate-600 py-3 text-sm font-semibold
                       text-slate-400 active:bg-slate-800 transition-colors"
          >
            Cerrar sesión
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-400 text-center">
              ¿Cerrar sesión? Tus datos locales no se borran.
            </p>
            <div className="flex gap-2">
              <button
                onClick={signOut}
                className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-3
                           text-sm font-bold text-red-400 active:bg-red-500/30 transition-colors"
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setSignOutConfirm(false)}
                className="flex-1 rounded-xl border border-slate-600 py-3 text-sm
                           text-slate-400 active:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
