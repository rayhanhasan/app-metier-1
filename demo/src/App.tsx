import { lazy, Suspense } from 'react'
import { useStore } from './store'
import { Sidebar, Topbar } from './ui/Shell'
import { PlanPage } from './pages/PlanPage'
import { LotsPage } from './pages/LotsPage'
import { DpePage } from './pages/DpePage'
import { ConnecteursPage } from './pages/ConnecteursPage'
import { Modals, Toasts } from './ui/Overlays'
import { KioskHint, useKiosk } from './ui/Kiosk'

const FichePage = lazy(() => import('./pages/FichePage').then((m) => ({ default: m.FichePage })))

export default function App() {
  const page = useStore((s) => s.page)
  useKiosk()

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative min-h-0 flex-1">
          {/* Le plan 3D reste monté pour garder la scène et la caméra entre deux pages */}
          <div className={page === 'plan' ? '' : 'invisible'}>
            <PlanPage active={page === 'plan'} />
          </div>
          {page === 'lots' && <LotsPage />}
          {page === 'dpe' && <DpePage />}
          {page === 'connecteurs' && <ConnecteursPage />}
          {page === 'fiche' && (
            <Suspense fallback={null}>
              <FichePage />
            </Suspense>
          )}
        </main>
      </div>
      <KioskHint />
      <Toasts />
      <Modals />
    </div>
  )
}
