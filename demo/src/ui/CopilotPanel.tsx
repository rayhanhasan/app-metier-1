import { useMemo } from 'react'
import { AlertTriangle, Banknote, Check, ChevronLeft, ChevronRight, ClipboardCheck, FileClock, Flame, Hammer, KeyRound, ListChecks, Receipt, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { computeAlerts, type Alert } from '../data/insights'

const ICONS: Record<Alert['kind'], typeof AlertTriangle> = {
  impaye: Banknote,
  dpe: Flame,
  'dpe-future': AlertTriangle,
  irl: TrendingUp,
  bail: FileClock,
  vacance: KeyRound,
  travaux: Hammer,
  devis: Hammer,
  diag: ClipboardCheck,
  regul: Receipt,
}

const SEV = {
  critique: { dot: 'bg-red-500', icon: 'bg-red-50 text-red-600', border: 'border-red-500', text: 'text-red-700' },
  important: { dot: 'bg-amber-500', icon: 'bg-amber-50 text-amber-600', border: 'border-amber-400', text: 'text-amber-700' },
  info: { dot: 'bg-blue-500', icon: 'bg-blue-50 text-blue-600', border: 'border-blue-300', text: 'text-blue-700' },
}

/** Exécute l'action « en un clic » d'une alerte (simulée pour la démo) */
export function useRunAlert() {
  const s = useStore()
  return (a: Alert) => {
    const lot = s.lots.find((l) => l.id === a.lotIds[0])
    switch (a.kind) {
      case 'impaye':
        s.toast({
          tone: 'success',
          title: a.cta === 'Relancer' ? `Relance envoyée à ${lot?.tenant?.name}` : `Procédure lancée — ${lot?.tenant?.name}`,
          body: a.cta === 'Relancer' ? 'SMS + e-mail envoyés. Escalade automatique à J+8 si pas de règlement.' : 'Mise en demeure générée (LRAR électronique) et déclaration GLI préparée.',
        })
        s.markDone(a.id)
        break
      case 'irl': {
        s.toast({ tone: 'success', title: `${a.lotIds.length} avis de révision générés`, body: `Envoi aux locataires programmé. Gain : ${a.impact}.` })
        for (const id of a.lotIds) {
          const l = s.lots.find((x) => x.id === id)
          if (l?.lease) s.updateLot(id, { lease: { ...l.lease, revised: true } })
        }
        s.markDone(a.id)
        break
      }
      case 'vacance':
        s.openModal({ kind: 'annonce', lotId: a.lotIds[0] })
        break
      case 'devis':
        s.toast({ tone: 'success', title: `Relance envoyée à ${lot?.owner}`, body: 'Le propriétaire peut valider le devis en un clic depuis son espace.' })
        s.markDone(a.id)
        break
      case 'regul':
        s.toast({ tone: 'success', title: `${a.lotIds.length} décomptes de charges générés`, body: 'Détail par poste joint, envoi par e-mail. Le locataire peut contester sous 3 ans : justificatifs archivés.' })
        s.markDone(a.id)
        break
      case 'diag':
        s.toast({ tone: 'success', title: 'Diagnostiqueur contacté', body: '3 créneaux proposés aux locataires concernés.' })
        s.markDone(a.id)
        break
      case 'bail':
        s.toast({ tone: 'info', title: 'Créneaux d’état des lieux proposés', body: `Le locataire choisit son créneau par SMS.` })
        s.markDone(a.id)
        break
      default:
        break
    }
  }
}

function AlertCard({ a, done }: { a: Alert; done: boolean }) {
  const s = useStore()
  const run = useRunAlert()
  const Icon = ICONS[a.kind]
  const sev = SEV[a.severity]

  const focus = () => {
    s.setPage('plan')
    s.setAnswer(null)
    s.setMode(a.mode)
    if (a.year) s.setYear(a.year)
    if (a.kind === 'dpe-future') {
      s.select(null)
      s.setHighlight(null)
    } else if (a.lotIds.length === 1) {
      s.setHighlight(null)
      s.select(a.lotIds[0])
    } else {
      s.select(null)
      s.setHighlight({ ids: a.lotIds, label: a.title })
    }
  }

  return (
    <div onClick={focus} className={`group cursor-pointer border-l-[3px] px-3 py-2.5 transition hover:bg-slate-50 ${done ? 'border-emerald-400 opacity-55' : sev.border}`}>
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md ${done ? 'bg-emerald-50 text-emerald-600' : sev.icon}`}>
          {done ? <Check size={15} /> : <Icon size={15} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-snug text-slate-900">{a.title}</div>
          <div className="mt-0.5 text-[12px] leading-snug text-slate-500">{a.detail}</div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {a.impact ? <span className={`text-[12px] font-semibold tabular-nums ${sev.text}`}>{a.impact}</span> : <span />}
            {done ? (
              <span className="text-[12px] font-semibold text-emerald-600">Traité</span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  focus()
                  run(a)
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[12px] font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
              >
                {a.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const GROUPS: { sev: Alert['severity']; label: string }[] = [
  { sev: 'critique', label: 'Urgent' },
  { sev: 'important', label: 'Cette semaine' },
  { sev: 'info', label: 'À suivre' },
]

export function CopilotPanel() {
  const lots = useStore((s) => s.lots)
  const done = useStore((s) => s.doneAlerts)
  const open = useStore((s) => s.copilotOpen)
  const setOpen = useStore((s) => s.setCopilotOpen)
  const alerts = useMemo(() => computeAlerts(lots), [lots])
  const todo = alerts.filter((a) => !done.includes(a.id))

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="panel pointer-events-auto flex items-center gap-2 self-start rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-700">
        <ListChecks size={16} className="text-slate-500" /> À traiter · {todo.length}
        <ChevronRight size={16} />
      </button>
    )

  return (
    <div className="panel pointer-events-auto flex max-h-full w-[340px] flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5">
        <div>
          <div className="text-[14px] font-semibold text-slate-900">À traiter aujourd’hui</div>
          <div className="text-[12px] text-slate-500">
            {todo.length} actions · triées par urgence et par montant
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Réduire">
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto">
        {GROUPS.map((g) => {
          const items = alerts.filter((a) => a.severity === g.sev)
          if (!items.length) return null
          return (
            <div key={g.sev}>
              <div className="sticky top-0 z-[1] flex items-center gap-2 border-b border-slate-100 bg-slate-50/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span className={`size-1.5 rounded-full ${SEV[g.sev].dot}`} /> {g.label} · {items.filter((a) => !done.includes(a.id)).length}
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((a) => (
                  <AlertCard key={a.id} a={a} done={done.includes(a.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
