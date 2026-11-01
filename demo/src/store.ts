import { create } from 'zustand'
import type { Intervention, Lot, ViewMode } from './data/types'
import { INITIAL_LOTS } from './data/portfolio'
import { CURRENT_YEAR, addDays } from './lib/utils'

export interface Toast {
  id: number
  title: string
  body?: string
  tone: 'success' | 'info' | 'warning'
}

export interface Answer {
  question: string
  text: string
  ids: string[]
  sources: string[]
}

export type Page = 'plan' | 'lots' | 'dpe' | 'connecteurs' | 'fiche'

export type Focus = { kind: 'home' } | { kind: 'lot'; id: string } | { kind: 'building'; id: string }

interface State {
  page: Page
  lots: Lot[]
  mode: ViewMode
  year: number
  selectedId: string | null
  hoveredId: string | null
  highlight: { ids: string[]; label: string } | null
  answer: Answer | null
  focus: Focus & { nonce: number }
  kiosk: boolean
  toasts: Toast[]
  doneAlerts: string[]
  modal: { kind: 'quittance' | 'intervention' | 'annonce'; lotId: string } | null
  /** Artisans en déplacement (déclenchés depuis l'app) */
  dispatches: { id: string; lotId: string; trade: Intervention['trade']; company: string; at: number }[]
  copilotOpen: boolean
  /** Texte tapé automatiquement par le mode salon dans la barre de question */
  kioskTyping: string | null

  setPage: (p: Page) => void
  setMode: (m: ViewMode) => void
  setYear: (y: number) => void
  select: (id: string | null, opts?: { keepMode?: boolean }) => void
  hover: (id: string | null) => void
  setHighlight: (h: State['highlight']) => void
  setAnswer: (a: Answer | null) => void
  focusOn: (f: Focus) => void
  setKiosk: (k: boolean) => void
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  markDone: (alertId: string) => void
  openModal: (m: State['modal']) => void
  updateLot: (id: string, patch: Partial<Lot>) => void
  dispatchArtisan: (lotId: string, trade: Intervention['trade'], company: string, title: string) => void
  setCopilotOpen: (o: boolean) => void
  setKioskTyping: (t: string | null) => void
}

let toastId = 1

export const useStore = create<State>((set, get) => ({
  page: 'plan',
  lots: INITIAL_LOTS,
  mode: 'global',
  year: CURRENT_YEAR,
  selectedId: null,
  hoveredId: null,
  highlight: null,
  answer: null,
  focus: { kind: 'home', nonce: 0 },
  kiosk: false,
  toasts: [],
  doneAlerts: [],
  modal: null,
  dispatches: [],
  copilotOpen: true,
  kioskTyping: null,

  setPage: (page) => set({ page }),
  setMode: (mode) => set({ mode, year: mode === 'dpe' ? get().year : CURRENT_YEAR }),
  setYear: (year) => set({ year }),
  select: (id) => {
    set({ selectedId: id })
    get().focusOn(id ? { kind: 'lot', id } : { kind: 'home' })
  },
  hover: (hoveredId) => set({ hoveredId }),
  setHighlight: (highlight) => set({ highlight }),
  setAnswer: (answer) => set({ answer }),
  focusOn: (f) => set({ focus: { ...f, nonce: get().focus.nonce + 1 } }),
  setKiosk: (kiosk) => set({ kiosk }),
  toast: (t) => {
    const id = toastId++
    set({ toasts: [...get().toasts, { ...t, id }].slice(-2) })
    setTimeout(() => get().dismissToast(id), 5200)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  markDone: (alertId) => set({ doneAlerts: [...new Set([...get().doneAlerts, alertId])] }),
  openModal: (modal) => set({ modal }),
  updateLot: (id, patch) => set({ lots: get().lots.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),
  dispatchArtisan: (lotId, trade, company, title) => {
    const lot = get().lots.find((l) => l.id === lotId)
    if (!lot) return
    const intervention: Intervention = { id: `${Date.now()}`, title, trade, company, status: 'en_cours', date: addDays(0) }
    set({
      lots: get().lots.map((l) => (l.id === lotId ? { ...l, interventions: [intervention, ...l.interventions] } : l)),
      dispatches: [...get().dispatches.filter((d) => d.lotId !== lotId), { id: intervention.id, lotId, trade, company, at: performance.now() }],
    })
  },
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  setKioskTyping: (kioskTyping) => set({ kioskTyping }),
}))

export const useSelectedLot = () => useStore((s) => s.lots.find((l) => l.id === s.selectedId) ?? null)
