import { useMemo } from 'react'
import { Wrench } from 'lucide-react'
import type { Lot, ViewMode } from '../data/types'
import { useStore } from '../store'
import { buildingById } from '../data/portfolio'
import { lotBadge } from '../data/insights'
import { artisanPath, buildingHeight, lotBox } from '../lib/geometry'
import { DPE_COLORS, fmtEur, isBanned } from '../lib/utils'
import { registerLabel } from '../lib/labels'
import { useVisits } from '../three/Life'

type Tone = 'red' | 'amber' | 'blue' | 'violet' | 'slate'

const TONES: Record<Tone, string> = {
  red: 'bg-red-600 text-white border-red-700',
  amber: 'bg-amber-500 text-white border-amber-600',
  blue: 'bg-blue-600 text-white border-blue-700',
  violet: 'bg-violet-600 text-white border-violet-700',
  slate: 'bg-slate-600 text-white border-slate-700',
}

function badgeFor(l: Lot, mode: ViewMode, year: number): { tone: Tone; text: string } | null {
  switch (mode) {
    case 'global': {
      const b = lotBadge(l)
      return b ? { tone: b.tone === 'slate' ? 'slate' : (b.tone as Tone), text: b.text } : null
    }
    case 'occupation':
      if (l.status === 'vacant') return { tone: 'slate', text: 'Vacant' }
      if (l.status === 'preavis') return { tone: 'amber', text: 'Préavis' }
      if (l.status === 'travaux') return { tone: 'violet', text: 'Travaux' }
      return null
    case 'loyers':
      if (l.payment === 'impaye') return { tone: 'red', text: `Impayé ${fmtEur(-l.balance)}` }
      if (l.payment === 'retard') return { tone: 'amber', text: `Retard ${fmtEur(-l.balance)}` }
      return null
    case 'dpe':
      if (l.status !== 'vacant' && isBanned(l.dpe.letter, year)) return { tone: 'red', text: `${l.dpe.letter} · interdit` }
      return null
    case 'travaux': {
      const i = l.interventions[0]
      if (!i) return null
      return { tone: i.status === 'en_cours' ? 'violet' : i.status === 'devis' ? 'amber' : 'blue', text: i.trade }
    }
  }
}

const base = 'pointer-events-auto absolute left-0 top-0 whitespace-nowrap will-change-transform'

function LotBadges() {
  const lots = useStore((s) => s.lots)
  const mode = useStore((s) => s.mode)
  const year = useStore((s) => s.year)
  const selectedId = useStore((s) => s.selectedId)
  const highlight = useStore((s) => s.highlight)
  const select = useStore((s) => s.select)

  const items = useMemo(
    () =>
      lots
        .map((l) => ({ l, badge: badgeFor(l, mode, year) }))
        .filter((x) => x.badge && (!highlight || highlight.ids.includes(x.l.id))),
    [lots, mode, year, highlight],
  )

  return (
    <>
      {items.map(({ l, badge }) => {
        const { center, size } = lotBox(l, buildingById[l.buildingId])
        const sel = selectedId === l.id
        const pos: [number, number, number] = [center[0], center[1] + size[1] / 2 - 0.05, center[2] + size[2] / 2 + (sel ? 1.15 : 0.15)]
        return (
          <button
            key={`${l.id}-${mode}-${sel}`}
            ref={registerLabel(`lot-${l.id}`, pos)}
            onClick={() => select(l.id)}
            style={{ visibility: 'hidden' }}
            className={`${base} flex items-center gap-1.5 rounded-md border py-0.5 pl-0.5 pr-2 text-[12px] font-semibold shadow-sm ${TONES[badge!.tone]}`}
          >
            <span className="rounded-[4px] bg-white px-1 text-[11px] font-bold text-slate-800">{l.id}</span>
            {badge!.text}
          </button>
        )
      })}
    </>
  )
}

function BuildingLabels() {
  const lots = useStore((s) => s.lots)
  const focusOn = useStore((s) => s.focusOn)
  const mode = useStore((s) => s.mode)
  const groups = useMemo(() => {
    const merged = [
      { ids: ['H'], name: 'Le Haussmann' },
      { ids: ['T'], name: 'Résidence Les Tilleuls' },
      { ids: ['A'], name: 'Les Ateliers' },
      { ids: ['M1', 'M2', 'M3'], name: 'Maisons des Jardins' },
    ]
    return merged.map((g) => {
      const bs = g.ids.map((id) => buildingById[id])
      const ls = lots.filter((l) => g.ids.includes(l.buildingId))
      const occ = ls.filter((l) => l.status === 'loue' || l.status === 'preavis').length
      const x = bs.reduce((s, b) => s + b.position[0], 0) / bs.length
      const z = bs[0].position[1]
      const h = Math.max(...bs.map(buildingHeight)) + (bs[0].style === 'haussmann' ? 1.9 : bs[0].style === 'house' ? 1.6 : 1.1)
      return { ...g, pos: [x, h, z] as [number, number, number], count: ls.length, occ }
    })
  }, [lots])

  if (mode !== 'global') return null
  return (
    <>
      {groups.map((g) => (
        <button
          key={g.name}
          ref={registerLabel(`b-${g.name}`, g.pos)}
          onClick={() => focusOn({ kind: 'building', id: g.ids[0] })}
          style={{ visibility: 'hidden' }}
          className={`${base} rounded-md border border-slate-300 bg-white px-2.5 py-1 text-left shadow-sm hover:border-blue-400`}
        >
          <div className="text-[12.5px] font-semibold text-slate-900">{g.name}</div>
          <div className="text-[11px] text-slate-500">
            {g.count} lots · {g.occ} occupés
          </div>
        </button>
      ))}
    </>
  )
}

function ArtisanLabels() {
  const visits = useVisits()
  const mode = useStore((s) => s.mode)
  const lots = useStore((s) => s.lots)
  const select = useStore((s) => s.select)
  if (mode === 'dpe') return null
  return (
    <>
      {visits.map((v) => {
        const lot = lots.find((l) => l.id === v.lotId)
        if (!lot) return null
        const door = artisanPath(buildingById[lot.buildingId]).waypoints.at(-1)!
        return (
          <button
            key={v.runId}
            ref={registerLabel(`art-${v.runId}`, [door[0], 1.45, door[1] + 0.3])}
            onClick={() => select(v.lotId)}
            style={{ visibility: 'hidden' }}
            className={`${base} flex items-center gap-1.5 rounded-md border border-violet-300 bg-white py-0.5 pl-0.5 pr-2 text-[12px] font-semibold text-slate-800 shadow-sm`}
          >
            <span className="grid size-[18px] place-items-center rounded bg-violet-600 text-white">
              <Wrench size={11} />
            </span>
            {v.trade} · {v.company}
          </button>
        )
      })}
    </>
  )
}

function HoverCard() {
  const lot = useStore((s) => s.lots.find((l) => l.id === s.hoveredId) ?? null)
  const selectedId = useStore((s) => s.selectedId)
  if (!lot || lot.id === selectedId) return null
  const b = buildingById[lot.buildingId]
  const { center, size } = lotBox(lot, b)
  return (
    <div
      ref={registerLabel('hover', [center[0], center[1] + size[1] / 2 + 0.2, center[2] + size[2] / 2])}
      style={{ visibility: 'hidden' }}
      className={`${base} pointer-events-none -mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">{lot.label}</span>
        <span className="rounded px-1.5 text-[11px] font-bold text-white" style={{ background: DPE_COLORS[lot.dpe.letter] }}>
          DPE {lot.dpe.letter}
        </span>
      </div>
      <div className="text-[12px] text-slate-500">
        {lot.typology} · {lot.surface} m² · {b.name}
      </div>
      <div className="mt-1 text-[12.5px] font-medium">{lot.tenant?.name ?? (lot.status === 'travaux' ? 'En travaux' : 'Vacant')}</div>
      <div className="text-[12px] text-slate-500">{fmtEur(lot.rent)} HC / mois · cliquer pour ouvrir</div>
    </div>
  )
}

/** Calque DOM au-dessus du canvas : étiquettes de lots, bâtiments, artisans. */
export function SceneLabels() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <BuildingLabels />
      <LotBadges />
      <ArtisanLabels />
      <HoverCard />
    </div>
  )
}
