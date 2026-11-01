import { useMemo } from 'react'
import { Database, Search, X } from 'lucide-react'
import { useStore } from '../store'
import { LEGENDS } from '../lib/colors'
import { CURRENT_YEAR, fmtEur, isBanned } from '../lib/utils'
import { DPE_BANS } from '../config'

// ── Frise réglementaire DPE ───────────────────────────────────
export function Timeline() {
  const mode = useStore((s) => s.mode)
  const year = useStore((s) => s.year)
  const setYear = useStore((s) => s.setYear)
  const lots = useStore((s) => s.lots)
  const min = 2025
  const max = 2035
  const stats = useMemo(() => {
    const occ = lots.filter((l) => l.status !== 'vacant')
    const banned = occ.filter((l) => isBanned(l.dpe.letter, year))
    return { count: banned.length, rent: banned.reduce((s, l) => s + l.rent * 12, 0), share: banned.length / lots.length }
  }, [lots, year])
  if (mode !== 'dpe') return null

  return (
    <div className="panel pointer-events-auto w-[min(720px,90%)] rounded-lg px-4 pb-2 pt-2.5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Projection · loi Climat et Résilience (art. 160)</div>
          <div className="text-[15px] text-slate-700">
            En <b className="text-slate-900">{year}</b> :{' '}
            <b className="text-red-600">
              {stats.count} logement{stats.count > 1 ? 's' : ''} interdit{stats.count > 1 ? 's' : ''} à la location
            </b>{' '}
            · <b className="tabular-nums text-slate-900">{fmtEur(stats.rent)}/an</b> de loyers bloqués
          </div>
        </div>
        <div className="text-right text-[22px] font-bold leading-none tabular-nums text-red-600">{Math.round(stats.share * 100)} %</div>
      </div>
      <div className="relative mt-5">
        <div className="pointer-events-none absolute -top-5 -translate-x-1/2 text-[11px] font-semibold text-blue-600" style={{ left: `${((CURRENT_YEAR - min) / (max - min)) * 100}%` }}>
          Aujourd’hui ▾
        </div>
        <input type="range" min={min} max={max} step={1} value={year} onChange={(e) => setYear(Number(e.target.value))} className="timeline w-full" />
        <div className="pointer-events-none relative mt-0.5 h-7">
          {DPE_BANS.map((b) => (
            <div key={b.letter} className="absolute -translate-x-1/2 text-center" style={{ left: `${((b.year - min) / (max - min)) * 100}%` }}>
              <div className="mx-auto h-2 w-0.5 bg-slate-300" />
              <div className="whitespace-nowrap text-[11.5px] font-semibold text-slate-600">
                {b.year} · <span className="text-red-600">{b.letter}</span> interdit
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}

// ── Légende ────────────────────────────────────────────────────
export function Legend() {
  const mode = useStore((s) => s.mode)
  const items = LEGENDS[mode]
  if (!items.length) return null
  return (
    <div className="panel pointer-events-auto flex items-center gap-3 rounded-md px-3 py-1.5">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-700">
          <span className="size-3 rounded" style={{ background: i.color }} />
          {i.label}
        </div>
      ))}
    </div>
  )
}

// ── Réponse à une question (barre de recherche) ──────────────
export function AnswerCard() {
  const answer = useStore((s) => s.answer)
  const setAnswer = useStore((s) => s.setAnswer)
  const highlight = useStore((s) => s.highlight)
  const setHighlight = useStore((s) => s.setHighlight)
  const clear = () => {
    setAnswer(null)
    setHighlight(null)
  }
  if (answer)
    return (
      <div className="panel panel-in pointer-events-auto w-[min(720px,90%)] rounded-lg">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Search size={13} /> {answer.question}
            </div>
            <div className="mt-1 text-[13.5px] leading-snug text-slate-800">{answer.text}</div>
          </div>
          <button onClick={clear} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Fermer">
            <X size={16} />
          </button>
        </div>
        {!!answer.sources.length && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-[11.5px] text-slate-500">
            <Database size={12} /> Sources :
            {answer.sources.map((s) => (
              <span key={s} className="rounded border border-slate-200 bg-white px-1.5 py-px text-slate-600">
                {s}
              </span>
            ))}
            {answer.ids.length > 0 && <span className="ml-auto">{answer.ids.length} lots surlignés sur le plan</span>}
          </div>
        )}
      </div>
    )
  if (highlight)
    return (
      <div className="panel pointer-events-auto flex items-center rounded-md py-1 pl-3 pr-1 text-[12.5px] font-medium text-slate-700">
        {highlight.label} · {highlight.ids.length} lot{highlight.ids.length > 1 ? 's' : ''}
        <button onClick={clear} className="ml-3 rounded p-1 hover:bg-slate-100">
          <X size={14} />
        </button>
      </div>
    )
  return null
}
