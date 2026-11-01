import { useEffect } from 'react'
import { Hand } from 'lucide-react'
import { useStore } from '../store'
import { askCopilot } from '../data/copilot'
import { KIOSK_IDLE_MS } from '../config'
import { CURRENT_YEAR } from '../lib/utils'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Mode salon : visite guidée en boucle pour attirer l'œil sur le stand.
 * Démarre via le bouton, la touche « S », ou après une période d'inactivité.
 * N'importe quelle interaction (clic, touche, molette) rend la main au visiteur.
 */
export function useKiosk() {
  const kiosk = useStore((s) => s.kiosk)

  // Inactivité → démarrage automatique ; interaction → arrêt
  useEffect(() => {
    const auto = new URLSearchParams(location.search).get('autosalon') !== '0'
    let timer = 0
    const arm = () => {
      clearTimeout(timer)
      if (auto) timer = window.setTimeout(() => useStore.getState().setKiosk(true), KIOSK_IDLE_MS)
    }
    const onUser = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-kiosk-toggle]')) return
      if (useStore.getState().kiosk) useStore.getState().setKiosk(false)
      arm()
    }
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.tagName === 'INPUT'
      if (!typing && e.key.toLowerCase() === 's') {
        useStore.getState().setKiosk(!useStore.getState().kiosk)
        arm()
        return
      }
      if (!typing && e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen()
      }
      onUser(e)
    }
    window.addEventListener('pointerdown', onUser)
    window.addEventListener('wheel', onUser, { passive: true })
    window.addEventListener('keydown', onKey)
    if (new URLSearchParams(location.search).has('salon')) useStore.getState().setKiosk(true)
    arm()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', onUser)
      window.removeEventListener('wheel', onUser)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // Scénario de la visite
  useEffect(() => {
    if (!kiosk) return
    let alive = true
    const s = () => useStore.getState()

    const type = async (q: string) => {
      for (let i = 1; i <= q.length && alive; i++) {
        s().setKioskTyping(q.slice(0, i))
        await wait(38)
      }
      await wait(350)
      if (!alive) return
      s().setKioskTyping(null)
      const r = askCopilot(q, s().lots)
      s().select(null)
      s().setMode(r.mode)
      if (r.year) s().setYear(r.year)
      s().setHighlight(r.ids.length ? { ids: r.ids, label: r.label } : null)
      s().setAnswer({ question: q, text: r.text, ids: r.ids, sources: r.sources })
    }
    const reset = () => {
      s().setAnswer(null)
      s().setHighlight(null)
      s().select(null)
    }

    const steps: (() => Promise<unknown>)[] = [
      async () => {
        reset()
        s().setPage('plan')
        s().setMode('global')
        await wait(7000)
      },
      async () => {
        await type('Qui n’a pas payé ce mois-ci ?')
        await wait(7500)
      },
      async () => {
        s().setAnswer(null)
        s().setHighlight(null)
        s().select('H-3B')
        await wait(6500)
      },
      async () => {
        reset()
        s().setMode('dpe')
        s().setYear(CURRENT_YEAR)
        await wait(3500)
        for (let y = CURRENT_YEAR + 1; y <= 2034 && alive; y++) {
          s().setYear(y)
          await wait(y === 2028 || y === 2034 ? 2600 : 700)
        }
      },
      async () => {
        s().setYear(CURRENT_YEAR)
        s().select('H-4C')
        await wait(7000)
      },
      async () => {
        reset()
        s().setMode('travaux')
        s().focusOn({ kind: 'building', id: 'H' })
        await wait(6500)
      },
      async () => {
        s().setMode('occupation')
        s().select('T-1A')
        await wait(6000)
      },
      async () => {
        await type('Quels loyers puis-je réviser ?')
        await wait(7500)
      },
    ]

    ;(async () => {
      while (alive) {
        for (const step of steps) {
          if (!alive) break
          await step()
        }
      }
    })()

    return () => {
      alive = false
      s().setKioskTyping(null)
    }
  }, [kiosk])
}

export function KioskHint() {
  const kiosk = useStore((s) => s.kiosk)
  if (!kiosk) return null
  return (
    <div className="pointer-events-none fixed left-1/2 top-[88px] z-[110] -translate-x-1/2">
      <div className="kiosk-hint flex items-center gap-2 rounded-full bg-slate-900/85 px-4 py-2 text-[14px] font-semibold text-white shadow-xl backdrop-blur">
        <Hand size={16} /> Touchez l’écran pour explorer
      </div>
    </div>
  )
}
