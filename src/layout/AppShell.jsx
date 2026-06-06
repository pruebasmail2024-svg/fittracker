import { NavLink }              from 'react-router-dom'
import { useNotifications }     from '../hooks/useNotifications'
import InAppReminderBanner      from '../components/InAppReminderBanner'
import BackupReminderBanner     from '../components/BackupReminderBanner'
import ErrorBanner              from '../components/ErrorBanner'
import { generateAndDownloadBackup } from '../services/exportService'
import { useHomeData }          from '../hooks/useHomeData'

const NAV_ITEMS = [
  { to: '/',            label: 'Inicio',   icon: '🏠' },
  { to: '/entrenar',    label: 'Entreno',  icon: '🏋️' },
  { to: '/historial',   label: 'Historial',icon: '📅' },
  { to: '/longevidad',  label: 'Longev.',  icon: '🧬' },
  { to: '/en-radar',    label: 'Radar',    icon: '🥗' },
  { to: '/config',      label: 'Config',   icon: '⚙️' },
]

export default function AppShell({ children }) {
  const {
    showBanner, bannerType, dismissBanner,
    showBackupBanner, dismissBackupBanner,
  } = useNotifications()
  const { error, reload } = useHomeData()

  async function handleBackupDownload() {
    try {
      await generateAndDownloadBackup()
      dismissBackupBanner()
    } catch {
      dismissBackupBanner()
    }
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-brand-400 font-bold tracking-wide text-sm uppercase">
          FitTracker
        </span>
      </header>

      {/* Banners bajo el header */}
      {error && <ErrorBanner onRetry={reload} />}
      {showBanner && (
        <InAppReminderBanner type={bannerType} onDismiss={dismissBanner} />
      )}
      {showBackupBanner && (
        <BackupReminderBanner
          onDownload={handleBackupDownload}
          onSnooze={dismissBackupBanner}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {children}
      </main>

      {/* Navegación inferior */}
      <nav className="border-t border-slate-800 bg-slate-900">
        <ul className="flex">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                    isActive
                      ? 'text-brand-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`
                }
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="leading-none">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
