import { useMemo, useRef, useState } from 'react'
import { Box, CornerDownLeft, Expand, FileText, Layers, Leaf, List, Play, Plug, Search, Square } from 'lucide-react'
import { useStore, type Page } from '../store'
import { computeAlerts, computeKpis } from '../data/insights'
import { SUGGESTIONS, askCopilot } from '../data/copilot'
import type { ViewMode } from '../data/types'
import { BRAND } from '../config'
import { fmtEur, fmtPct } from '../lib/utils'

// ── Navigation latérale ───────────────────────────────────────
const NAV: { id: Page; label: string; icon: typeof Box }[] = [
  { id: 'plan', label: 'Plan du parc', icon: Box },
  { id: 'lots', label: 'Lots & locataires', icon: List },
  { id: 'dpe', label: 'Conformité DPE', icon: Leaf },
  { id: 'connecteurs', label: 'Connecteurs', icon: Plug },
]

function NavButton({ active, onClick, icon: Icon, children, badge, ...rest }: { active?: boolean; onClick: () => void; icon: typeof Box; children: React.ReactNode; badge?: number } & Record<string, unknown>) {
  return (
    <button
      {...rest}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] transition ${
        active ? 'bg-blue-50 font-semibold text-blue-800' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon size={17} className={active ? 'text-blue-700' : 'text-slate-400'} />
      <span className="flex-1">{children}</span>
      {!!badge && <span className="rounded bg-red-100 px-1.5 text-[11px] font-bold text-red-700">{badge}</span>}
    </button>
  )
}

export function Sidebar() {
  const page = useStore((s) => s.page)
  const setPage = useStore((s) => s.setPage)
  const kiosk = useStore((s) => s.kiosk)
  const setKiosk = useStore((s) => s.setKiosk)
  const lots = useStore((s) => s.lots)
  const doneAlerts = useStore((s) => s.doneAlerts)
  const todo = useMemo(() => computeAlerts(lots).filter((a) => !doneAlerts.includes(a.id)).length, [lots, doneAlerts])
  const late = lots.filter((l) => l.payment !== 'ok').length
  const banned = useMemo(() => computeKpis(lots).bannedNow, [lots])

  return (
    <aside className="flex w-[228px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
        <div className="grid size-8 place-items-center rounded-md bg-slate-900 text-[12px] font-bold text-white">HG</div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-slate-900">{BRAND.agency}</div>
          <div className="truncate text-[11.5px] text-slate-500">Gestion locative · {BRAND.city}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map((n) => (
          <NavButton
            key={n.id}
            active={page === n.id}
            onClick={() => setPage(n.id)}
            icon={n.icon}
            badge={n.id === 'plan' ? todo : n.id === 'lots' ? late : n.id === 'dpe' ? banned : undefined}
          >
            {n.label}
          </NavButton>
        ))}

        <div className="px-2.5 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Présentation</div>
        <NavButton active={page === 'fiche'} onClick={() => setPage('fiche')} icon={FileText}>
          Fiche & comparatif
        </NavButton>
        <NavButton
          data-kiosk-toggle
          onClick={() => {
            setPage('plan')
            setKiosk(!kiosk)
          }}
          icon={kiosk ? Square : Play}
        >
          {kiosk ? 'Arrêter le mode salon' : 'Mode salon'}
        </NavButton>
        <NavButton onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())} icon={Expand}>
          Plein écran
        </NavButton>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-full bg-slate-200 text-[12px] font-semibold text-slate-700">SM</div>
          <div className="min-w-0 text-[12.5px]">
            <div className="font-medium text-slate-800">{BRAND.user} Martin</div>
            <div className="text-slate-500">Gestionnaire · {lots.length} lots</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── Barre de recherche / questions ─────────────────────────────
export function runQuestion(text: string) {
  const s = useStore.getState()
  const r = askCopilot(text, s.lots)
  s.setPage('plan')
  s.select(null)
  s.setMode(r.mode)
  if (r.year) s.setYear(r.year)
  s.setHighlight(r.ids.length ? { ids: r.ids, label: r.label } : null)
  s.setAnswer({ question: text, text: r.text, ids: r.ids, sources: r.sources })
}

export function SearchBar() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const typed = useStore((s) => s.kioskTyping)
  const input = useRef<HTMLInputElement>(null)

  const submit = (text: string) => {
    if (!text.trim()) return
    runQuestion(text)
    setQ('')
    setOpen(false)
    input.current?.blur()
  }

  return (
    <div className="relative w-[min(540px,44vw)]">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(q)
        }}
        className={`flex items-center gap-2 rounded-lg border bg-slate-50 px-3 ${open || typed ? 'border-blue-500 bg-white ring-2 ring-blue-500/15' : 'border-slate-300'}`}
      >
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          ref={input}
          value={typed ?? q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Rechercher un lot, un locataire, ou poser une question…"
          className="min-w-0 flex-1 bg-transparent py-2 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <kbd className="hidden items-center gap-1 rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-400 md:flex">
          <CornerDownLeft size={11} /> Entrée
        </kbd>
      </form>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <div className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Questions fréquentes</div>
          {SUGGESTIONS.map((s) => (
            <button key={s} onMouseDown={() => submit(s)} className="block w-full px-3 py-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-50">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const TITLES: Record<Page, string> = {
  plan: 'Plan du parc',
  lots: 'Lots & locataires',
  dpe: 'Conformité DPE',
  connecteurs: 'Connecteurs & sources',
  fiche: 'Fiche & comparatif',
}

function Stat({ label, value, tone = 'text-slate-900' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-[14px] font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  )
}

export function Topbar() {
  const page = useStore((s) => s.page)
  const lots = useStore((s) => s.lots)
  const k = useMemo(() => computeKpis(lots), [lots])
  return (
    <header className="relative z-20 flex h-[58px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
      <div className="w-[170px] min-w-0">
        <div className="text-[11.5px] text-slate-400">{BRAND.agency} /</div>
        <div className="-mt-0.5 truncate text-[15px] font-semibold text-slate-900">{TITLES[page]}</div>
      </div>
      <div className="flex flex-1 justify-center">
        <SearchBar />
      </div>
      <div className="hidden items-center gap-5 text-right min-[1480px]:flex">
        <Stat label="Occupation" value={fmtPct(k.occupancy)} />
        <Stat label="Encaissé ce mois" value={fmtEur(k.collected)} />
        <Stat label="Impayés" value={fmtEur(k.arrears)} tone="text-red-600" />
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11.5px] font-medium text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" /> Synchronisé
      </div>
    </header>
  )
}

// ── Calques du plan 3D ─────────────────────────────────────────
const MODES: { id: ViewMode; label: string }[] = [
  { id: 'global', label: 'Alertes' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'loyers', label: 'Loyers' },
  { id: 'dpe', label: 'DPE' },
  { id: 'travaux', label: 'Travaux' },
]

export function ModeTabs() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const setHighlight = useStore((s) => s.setHighlight)
  const setAnswer = useStore((s) => s.setAnswer)
  return (
    <div className="panel pointer-events-auto flex items-center gap-0.5 rounded-lg p-1">
      <span className="flex items-center gap-1.5 px-2 text-[12px] font-medium text-slate-500">
        <Layers size={14} /> Calque
      </span>
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => {
            setMode(m.id)
            setHighlight(null)
            setAnswer(null)
          }}
          className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${mode === m.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
