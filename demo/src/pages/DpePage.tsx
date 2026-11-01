import { useMemo } from 'react'
import { Box, ExternalLink, Send } from 'lucide-react'
import { useStore } from '../store'
import { buildingById } from '../data/portfolio'
import type { DpeLetter, Lot } from '../data/types'
import { CURRENT_YEAR, DPE_COLORS, banYear, daysFromToday, fmtDate, fmtEur, isBanned, renovationPlan } from '../lib/utils'

const LETTERS: DpeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const YEARS = Array.from({ length: 10 }, (_, i) => 2025 + i)

function Card({ title, children, right, className = '' }: { title: string; children: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-[13.5px] font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function DpePage() {
  const lots = useStore((s) => s.lots)
  const toast = useStore((s) => s.toast)
  const select = useStore((s) => s.select)
  const setPage = useStore((s) => s.setPage)
  const setMode = useStore((s) => s.setMode)

  const dist = useMemo(() => LETTERS.map((l) => ({ l, n: lots.filter((x) => x.dpe.letter === l).length })), [lots])
  const rented = (l: Lot) => l.status !== 'vacant'

  const byYear = useMemo(
    () =>
      YEARS.map((y) => {
        const ls = lots.filter((l) => rented(l) && isBanned(l.dpe.letter, y))
        return { y, n: ls.length, rent: ls.reduce((s, l) => s + l.rent * 12, 0) }
      }),
    [lots],
  )
  const maxRent = Math.max(...byYear.map((b) => b.rent), 1)

  const plan = useMemo(
    () =>
      lots
        .filter((l) => ['E', 'F', 'G'].includes(l.dpe.letter))
        .map((l) => ({ l, p: renovationPlan(l)!, ban: banYear(l.dpe.letter)! }))
        .sort((a, b) => a.ban - b.ban || b.p.annualRent - a.p.annualRent),
    [lots],
  )
  const budget = (y: number) => plan.filter((x) => x.ban <= y).reduce((s, x) => s + x.p.cost, 0)

  const open3d = (id: string) => {
    setPage('plan')
    setMode('dpe')
    select(id)
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4">
        {/* Chiffres clés */}
        {[
          { k: 'Interdits aujourd’hui', v: `${byYear[CURRENT_YEAR - 2025].n} lots`, s: `${fmtEur(byYear[CURRENT_YEAR - 2025].rent)}/an de loyers`, c: 'text-red-600' },
          { k: 'Interdits au 1er janvier 2028 (cumul)', v: `${byYear[2028 - 2025].n} lots`, s: `${fmtEur(byYear[2028 - 2025].rent)}/an · dans ${Math.round(daysFromToday('2028-01-01') / 30)} mois`, c: 'text-orange-600' },
          { k: 'Interdits au 1er janvier 2034 (cumul)', v: `${byYear[2034 - 2025].n} lots`, s: `${fmtEur(byYear[2034 - 2025].rent)}/an`, c: 'text-amber-600' },
          { k: 'Budget travaux d’ici 2028', v: fmtEur(budget(2028)), s: 'estimation indicative, avant aides', c: 'text-slate-900' },
        ].map((x) => (
          <div key={x.k} className="col-span-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="text-[12px] text-slate-500">{x.k}</div>
            <div className={`text-[22px] font-semibold tabular-nums ${x.c}`}>{x.v}</div>
            <div className="text-[12px] text-slate-500">{x.s}</div>
          </div>
        ))}

        {/* Répartition */}
        <Card title="Répartition du parc par étiquette" className="col-span-5">
          <div className="space-y-1.5">
            {dist.map(({ l, n }) => (
              <div key={l} className="flex items-center gap-2">
                <span className="grid h-6 w-7 place-items-center rounded text-[12px] font-bold text-white" style={{ background: DPE_COLORS[l] }}>
                  {l}
                </span>
                <div className="h-6 flex-1 rounded bg-slate-100">
                  <div className="flex h-6 items-center rounded pl-2 text-[12px] font-semibold text-white" style={{ width: `${Math.max(4, (n / lots.length) * 100 * 2.2)}%`, background: DPE_COLORS[l] }}>
                    {n > 0 ? n : ''}
                  </div>
                </div>
                <span className="w-24 text-right text-[12px] text-slate-500">
                  {banYear(l) ? (isBanned(l, CURRENT_YEAR) ? 'interdit' : `interdit ${banYear(l)}`) : 'louable'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">Étiquettes issues des DPE enregistrés à l’Observatoire ADEME (numéro à 13 caractères).</p>
        </Card>

        {/* Projection */}
        <Card title="Loyers annuels bloqués si aucun travaux n’est engagé" className="col-span-7">
          <div className="flex h-[190px] items-end gap-2">
            {byYear.map((b) => (
              <div key={b.y} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] font-semibold tabular-nums text-slate-600">{b.rent ? `${Math.round(b.rent / 1000)} k€` : ''}</span>
                <div
                  className={`w-full rounded-t ${b.y === CURRENT_YEAR ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                  style={{ height: `${(b.rent / maxRent) * 140 + 2}px`, background: b.y >= 2034 ? DPE_COLORS.E : b.y >= 2028 ? DPE_COLORS.F : DPE_COLORS.G }}
                />
                <span className={`text-[11.5px] tabular-nums ${b.y === CURRENT_YEAR ? 'font-bold text-blue-700' : 'text-slate-500'}`}>{b.y}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-[11.5px] text-slate-500">
            <span>
              <b className="text-slate-700">2025</b> : G non décents
            </span>
            <span>
              <b className="text-slate-700">2028</b> : F non décents
            </span>
            <span>
              <b className="text-slate-700">2034</b> : E non décents
            </span>
            <span className="ml-auto">Source : loi n° 2021-1104, art. 160 (Légifrance)</span>
          </div>
        </Card>

        {/* Plan de travaux */}
        <Card
          title={`Plan de travaux · ${plan.length} lots concernés`}
          className="col-span-12"
          right={
            <button
              onClick={() => toast({ tone: 'success', title: 'Demandes de devis envoyées', body: `${plan.filter((x) => x.ban <= 2028).length} lots prioritaires · 3 entreprises RGE consultées par lot.` })}
              className="btn-primary !py-1.5"
            >
              <Send size={14} /> Demander les devis 2025-2028
            </button>
          }
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11.5px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">Lot</th>
                <th className="py-2 pr-3 font-semibold">DPE</th>
                <th className="py-2 pr-3 font-semibold">Interdiction</th>
                <th className="py-2 pr-3 font-semibold">Fin de bail</th>
                <th className="py-2 pr-3 font-semibold">Travaux recommandés</th>
                <th className="py-2 pr-3 text-right font-semibold">Budget estimé</th>
                <th className="py-2 pr-3 text-right font-semibold">Loyer sécurisé</th>
                <th className="py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {plan.map(({ l, p, ban }) => {
                const b = buildingById[l.buildingId]
                const late = isBanned(l.dpe.letter, CURRENT_YEAR)
                return (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-slate-900">{l.id}</div>
                      <div className="text-[12px] text-slate-500">
                        {b.name} · {l.surface} m²
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="grid size-5 place-items-center rounded text-[11px] font-bold text-white" style={{ background: DPE_COLORS[l.dpe.letter] }}>
                          {l.dpe.letter}
                        </span>
                        <span className="text-[12px] text-slate-500">{l.dpe.kwh} kWh</span>
                      </span>
                    </td>
                    <td className={`py-2 pr-3 font-medium ${late ? 'text-red-600' : ban === 2028 ? 'text-orange-600' : 'text-amber-700'}`}>{late ? `depuis 01/${ban}` : `01/01/${ban}`}</td>
                    <td className="py-2 pr-3 text-slate-600">{l.lease ? fmtDate(l.lease.end) : l.status === 'vacant' ? 'vacant' : '—'}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {p.works.join(' · ')} <span className="text-slate-400">→ {p.target}</span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmtEur(p.cost)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-700">{fmtEur(p.annualRent)}/an</td>
                    <td className="py-2 text-right">
                      <button onClick={() => open3d(l.id)} title="Voir sur le plan 3D" className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700">
                        <Box size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
            <span>
              Budget total d’ici 2034 : <b className="text-slate-800">{fmtEur(budget(2034))}</b> · loyers sécurisés : <b className="text-emerald-700">{fmtEur(plan.reduce((s, x) => s + x.p.annualRent, 0))}/an</b>
            </span>
            <a href="https://france-renov.gouv.fr/aides/maprimerenov" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
              Aides MaPrimeRénov’ (France Rénov’) <ExternalLink size={12} />
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
