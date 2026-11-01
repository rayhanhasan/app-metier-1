import { useMemo, useState } from 'react'
import { ArrowDownUp, Box, Download, Search, Send, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { buildingById } from '../data/portfolio'
import type { Lot } from '../data/types'
import { LotPanel } from '../ui/LotPanel'
import { CURRENT_YEAR, DPE_COLORS, daysFromToday, fmtDate, fmtEur, irlGain, isBanned, normalize } from '../lib/utils'

type Filter = 'tous' | 'paiement' | 'vacance' | 'dpe' | 'irl' | 'travaux'

const FILTERS: { id: Filter; label: string; test: (l: Lot) => boolean }[] = [
  { id: 'tous', label: 'Tous', test: () => true },
  { id: 'paiement', label: 'Retards & impayés', test: (l) => l.payment !== 'ok' },
  { id: 'vacance', label: 'Vacants & préavis', test: (l) => l.status !== 'loue' },
  { id: 'dpe', label: 'Passoires E · F · G', test: (l) => ['E', 'F', 'G'].includes(l.dpe.letter) },
  { id: 'irl', label: 'Révision IRL possible', test: (l) => irlGain(l) > 0 },
  { id: 'travaux', label: 'Travaux', test: (l) => l.interventions.length > 0 },
]

type SortKey = 'id' | 'rent' | 'dpe' | 'end' | 'balance'

const STATUS_LABEL: Record<Lot['status'], string> = { loue: 'Loué', vacant: 'Vacant', preavis: 'Préavis', travaux: 'Travaux' }
const STATUS_CLS: Record<Lot['status'], string> = {
  loue: 'text-slate-700',
  vacant: 'bg-slate-100 text-slate-700',
  preavis: 'bg-amber-50 text-amber-700',
  travaux: 'bg-violet-50 text-violet-700',
}

function endOf(l: Lot) {
  return l.noticeEnd ?? l.lease?.end ?? null
}

function exportCsv(rows: Lot[]) {
  const head = ['Lot', 'Immeuble', 'Adresse', 'Type', 'Surface', 'Locataire', 'Téléphone', 'Loyer HC', 'Charges', 'Solde', 'Paiement', 'DPE', 'kWh/m2/an', 'Fin de bail', 'Propriétaire']
  const lines = rows.map((l) => {
    const b = buildingById[l.buildingId]
    return [l.id, b.name, b.address, l.typology, l.surface, l.tenant?.name ?? '', l.tenant?.phone ?? '', l.rent, l.charges, l.balance, l.payment, l.dpe.letter, l.dpe.kwh, endOf(l) ? fmtDate(endOf(l)!) : '', l.owner]
  })
  const csv = [head, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `etat-locatif-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function LotsPage() {
  const lots = useStore((s) => s.lots)
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const toast = useStore((s) => s.toast)
  const updateLot = useStore((s) => s.updateLot)
  const markDone = useStore((s) => s.markDone)
  const [filter, setFilter] = useState<Filter>('tous')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'id', dir: 1 })

  const rows = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!
    const nq = normalize(q)
    const out = lots.filter(f.test).filter((l) => {
      if (!nq) return true
      const b = buildingById[l.buildingId]
      return normalize(`${l.id} ${l.tenant?.name ?? ''} ${b.name} ${b.address} ${l.owner} ${l.typology}`).includes(nq)
    })
    const val = (l: Lot): number | string => {
      switch (sort.key) {
        case 'rent':
          return l.rent
        case 'dpe':
          return l.dpe.kwh
        case 'end':
          return endOf(l) ? new Date(endOf(l)!).getTime() : Infinity
        case 'balance':
          return l.balance
        default:
          return `${l.buildingId}-${String(l.floor).padStart(2, '0')}-${l.col}`
      }
    }
    return [...out].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir)
  }, [lots, filter, q, sort])

  const totals = useMemo(() => ({ rent: rows.reduce((s, l) => s + l.rent, 0), balance: rows.reduce((s, l) => s + Math.min(0, l.balance), 0) }), [rows])

  const Th = ({ k, children, right }: { k?: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th
      onClick={() => k && setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }))}
      className={`sticky top-0 z-[1] border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 ${right ? 'text-right' : 'text-left'} ${k ? 'cursor-pointer hover:text-slate-800' : ''}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {k && <ArrowDownUp size={11} className={sort.key === k ? 'text-blue-600' : 'text-slate-300'} />}
      </span>
    </th>
  )

  const bulk = () => {
    if (filter === 'paiement') {
      toast({ tone: 'success', title: `${rows.length} relances envoyées`, body: 'SMS + e-mail avec lien de paiement. Escalade automatique à J+8.' })
      rows.forEach((l) => {
        markDone(`impaye-${l.id}`)
        markDone(`retard-${l.id}`)
      })
    } else if (filter === 'irl') {
      rows.forEach((l) => l.lease && updateLot(l.id, { lease: { ...l.lease, revised: true } }))
      markDone('irl')
      toast({ tone: 'success', title: `${rows.length} avis de révision générés`, body: 'Courriers prêts à l’envoi, loyers mis à jour à la prochaine échéance.' })
    } else if (filter === 'dpe') {
      toast({ tone: 'success', title: 'Demandes de devis envoyées', body: `${rows.length} lots · 3 entreprises RGE consultées par lot.` })
    }
  }
  const bulkLabel =
    filter === 'paiement'
      ? { icon: Send, text: `Relancer les ${rows.length} locataires` }
      : filter === 'irl'
        ? { icon: TrendingUp, text: `Appliquer ${rows.length} révisions (+${fmtEur(rows.reduce((s, l) => s + irlGain(l), 0) * 12)}/an)` }
        : filter === 'dpe'
          ? { icon: Send, text: `Demander des devis (${rows.length} lots)` }
          : null

  return (
    <div className="absolute inset-0 flex bg-slate-50">
      <div className="flex min-w-0 flex-1 flex-col p-5">
        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const n = lots.filter(f.test).length
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md border px-3 py-1.5 text-[13px] font-medium ${filter === f.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}
              >
                {f.label} <span className={filter === f.id ? 'text-slate-300' : 'text-slate-400'}>{n}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex w-[320px] items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : lot, locataire, adresse, propriétaire…" className="w-full bg-transparent py-1.5 text-[13px] outline-none" />
          </div>
          <div className="flex-1" />
          {bulkLabel && (
            <button onClick={bulk} className="btn-primary">
              <bulkLabel.icon size={15} /> {bulkLabel.text}
            </button>
          )}
          <button onClick={() => exportCsv(rows)} className="btn-secondary">
            <Download size={15} /> Exporter (CSV)
          </button>
        </div>

        {/* Tableau */}
        <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <Th k="id">Lot</Th>
                <Th>Immeuble</Th>
                <Th>Type</Th>
                <Th>Locataire</Th>
                <Th k="rent" right>
                  Loyer HC
                </Th>
                <Th k="balance" right>
                  Solde
                </Th>
                <Th k="dpe">DPE</Th>
                <Th k="end">Échéance</Th>
                <Th>Statut</Th>
                <Th>{null}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const b = buildingById[l.buildingId]
                const end = endOf(l)
                const days = end ? daysFromToday(end) : null
                const banned = isBanned(l.dpe.letter, CURRENT_YEAR)
                return (
                  <tr key={l.id} onClick={() => useStore.setState({ selectedId: l.id })} className={`cursor-pointer border-b border-slate-100 ${selectedId === l.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{l.id}</td>
                    <td className="px-3 py-2 text-slate-600">{b.name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {l.typology} · {l.surface} m²
                    </td>
                    <td className="px-3 py-2">{l.tenant?.name ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtEur(l.rent)}</td>
                    <td className={`px-3 py-2 text-right font-medium tabular-nums ${l.balance < 0 ? 'text-red-600' : 'text-slate-400'}`}>{l.balance < 0 ? fmtEur(l.balance) : '0 €'}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="grid size-5 place-items-center rounded text-[11px] font-bold text-white" style={{ background: DPE_COLORS[l.dpe.letter] }}>
                          {l.dpe.letter}
                        </span>
                        {banned && <span className="text-[11.5px] font-semibold text-red-600">interdit</span>}
                        {!banned && (l.dpe.letter === 'F' || l.dpe.letter === 'E') && <span className="text-[11.5px] text-amber-700">{l.dpe.letter === 'F' ? '2028' : '2034'}</span>}
                      </span>
                    </td>
                    <td className={`px-3 py-2 tabular-nums ${days !== null && days < 90 ? 'font-semibold text-amber-700' : 'text-slate-600'}`}>{end ? `${fmtDate(end)}` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[12px] font-medium ${STATUS_CLS[l.status]} ${l.payment === 'impaye' ? '!bg-red-50 !text-red-700' : l.payment === 'retard' ? '!bg-amber-50 !text-amber-700' : ''}`}>
                        {l.payment === 'impaye' ? 'Impayé' : l.payment === 'retard' ? 'Retard' : STATUS_LABEL[l.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        title="Voir sur le plan 3D"
                        onClick={(e) => {
                          e.stopPropagation()
                          useStore.getState().setPage('plan')
                          select(l.id)
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Box size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="sticky bottom-0 bg-slate-50 text-[12.5px] font-semibold text-slate-700">
                <td className="px-3 py-2" colSpan={4}>
                  {rows.length} lots
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtEur(totals.rent)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-red-600">{totals.balance < 0 ? fmtEur(totals.balance) : '0 €'}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {selectedId && (
        <div className="flex w-[400px] shrink-0 flex-col border-l border-slate-200 bg-slate-50 p-3">
          <LotPanel embedded />
        </div>
      )}
    </div>
  )
}
