import { useState } from 'react'
import { CheckCircle2, Loader2, MapPin, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react'
import { useStore } from '../store'
import { DPE_COLORS, fmtDate } from '../lib/utils'
import { IRL } from '../config'
import { OFFLINE_SAMPLE, dpeAround, geocode, irlSeries, risks, type DpeResult, type Geo, type IrlPoint } from '../lib/openData'

type Kind = 'live' | 'partner' | 'import'

interface Node {
  id: string
  name: string
  what: string
  kind: Kind
}

const LEFT: Node[] = [
  { id: 'ademe', name: 'ADEME · Observatoire DPE', what: 'Étiquettes et validité des DPE', kind: 'live' },
  { id: 'insee', name: 'INSEE · IRL', what: 'Indice trimestriel des loyers', kind: 'live' },
  { id: 'ign', name: 'IGN · Géoplateforme', what: 'Adresses normalisées (BAN)', kind: 'live' },
  { id: 'georisques', name: 'Géorisques', what: 'État des risques (annexe du bail)', kind: 'live' },
  { id: 'legifrance', name: 'Légifrance · Service-public', what: 'Textes et calendriers officiels', kind: 'live' },
]
const RIGHT: Node[] = [
  { id: 'bank', name: 'Banque (open banking DSP2)', what: 'Rapprochement des loyers reçus', kind: 'partner' },
  { id: 'sign', name: 'Signature électronique', what: 'Baux, avenants, mandats', kind: 'partner' },
  { id: 'lre', name: 'Lettre recommandée électronique', what: 'Mises en demeure, congés', kind: 'partner' },
  { id: 'sms', name: 'SMS & e-mail', what: 'Relances, convocations, artisans', kind: 'partner' },
  { id: 'portails', name: 'Portails d’annonces', what: 'Diffusion des lots vacants', kind: 'partner' },
]
const BOTTOM: Node[] = [
  { id: 'compta', name: 'Votre logiciel actuel', what: 'Import CSV / FEC / API, sans migration', kind: 'import' },
  { id: 'ec', name: 'Expert-comptable', what: 'Export FEC', kind: 'import' },
]
const TOP = ['Gestionnaires (web)', 'Propriétaires (espace)', 'Locataires (portail)', 'Artisans (mobile)']

const KIND: Record<Kind, { label: string; stroke: string; dot: string; dash?: string }> = {
  live: { label: 'API publique · en direct', stroke: '#16a34a', dot: '#16a34a' },
  partner: { label: 'Service partenaire (simulé en démo)', stroke: '#64748b', dot: '#64748b', dash: '5 4' },
  import: { label: 'Import / export', stroke: '#2563eb', dot: '#2563eb', dash: '2 4' },
}

function Diagram() {
  const W = 1000
  const H = 400
  const cx = W / 2
  const cy = 200
  const nodeW = 250
  const nodeH = 46
  const yFor = (i: number) => 58 + i * 60
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {/* liaisons */}
      {LEFT.map((n, i) => (
        <path key={n.id} d={`M ${20 + nodeW} ${yFor(i) + nodeH / 2} C ${cx - 150} ${yFor(i) + nodeH / 2}, ${cx - 150} ${cy}, ${cx - 95} ${cy}`} fill="none" stroke={KIND[n.kind].stroke} strokeWidth={1.6} strokeDasharray={KIND[n.kind].dash} />
      ))}
      {RIGHT.map((n, i) => (
        <path key={n.id} d={`M ${W - 20 - nodeW} ${yFor(i) + nodeH / 2} C ${cx + 150} ${yFor(i) + nodeH / 2}, ${cx + 150} ${cy}, ${cx + 95} ${cy}`} fill="none" stroke={KIND[n.kind].stroke} strokeWidth={1.6} strokeDasharray={KIND[n.kind].dash} />
      ))}
      {BOTTOM.map((n, i) => {
        const x = cx - 135 + i * 270
        return <path key={n.id} d={`M ${x} ${H - 54} L ${x} ${cy + 70} L ${cx} ${cy + 46}`} fill="none" stroke={KIND[n.kind].stroke} strokeWidth={1.6} strokeDasharray={KIND[n.kind].dash} />
      })}
      <line x1={cx} y1={34} x2={cx} y2={cy - 46} stroke="#94a3b8" strokeWidth={1.6} />

      {/* utilisateurs */}
      <g>
        {TOP.map((t, i) => {
          const w = 112
          const x = cx - (TOP.length * (w + 8)) / 2 + i * (w + 8)
          return (
            <g key={t}>
              <rect x={x} y={8} width={w} height={26} rx={5} fill="#f8fafc" stroke="#cbd5e1" />
              <text x={x + w / 2} y={25} textAnchor="middle" fontSize={10.5} fill="#334155">
                {t}
              </text>
            </g>
          )
        })}
      </g>

      {/* noeud central */}
      <rect x={cx - 95} y={cy - 46} width={190} height={92} rx={10} fill="#0f172a" />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff">
        Atlas
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fill="#cbd5e1">
        état locatif · alertes · plan 3D
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
        hébergé en France · RGPD
      </text>

      {[...LEFT.map((n, i) => ({ n, x: 20, y: yFor(i) })), ...RIGHT.map((n, i) => ({ n, x: W - 20 - nodeW, y: yFor(i) }))].map(({ n, x, y }) => (
        <g key={n.id}>
          <rect x={x} y={y} width={nodeW} height={nodeH} rx={6} fill="#fff" stroke="#e2e8f0" />
          <circle cx={x + 14} cy={y + 16} r={4} fill={KIND[n.kind].dot} />
          <text x={x + 26} y={y + 20} fontSize={12.5} fontWeight={600} fill="#0f172a">
            {n.name}
          </text>
          <text x={x + 26} y={y + 36} fontSize={11} fill="#64748b">
            {n.what}
          </text>
        </g>
      ))}
      {BOTTOM.map((n, i) => {
        const x = cx - 135 + i * 270 - 120
        const y = H - 54
        return (
          <g key={n.id}>
            <rect x={x} y={y} width={240} height={46} rx={6} fill="#fff" stroke="#bfdbfe" />
            <circle cx={x + 14} cy={y + 16} r={4} fill={KIND[n.kind].dot} />
            <text x={x + 26} y={y + 20} fontSize={12.5} fontWeight={600} fill="#0f172a">
              {n.name}
            </text>
            <text x={x + 26} y={y + 36} fontSize={11} fill="#64748b">
              {n.what}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Box({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-[13.5px] font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function AddressCheck() {
  const [q, setQ] = useState('12 rue Vauban, Lyon')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [offline, setOffline] = useState(false)
  const [res, setRes] = useState<{ geo: Geo; dpe: DpeResult; risks: string[]; ms: number } | null>(null)

  const run = async () => {
    setState('loading')
    const t0 = performance.now()
    try {
      const geo = await geocode(q)
      const [dpe, rk] = await Promise.all([dpeAround(geo, 30), risks(geo).catch(() => [])])
      setRes({ geo, dpe, risks: rk, ms: Math.round(performance.now() - t0) })
      setOffline(false)
    } catch {
      setRes({ geo: OFFLINE_SAMPLE.geo, dpe: OFFLINE_SAMPLE.dpe, risks: OFFLINE_SAMPLE.risks, ms: 0 })
      setOffline(true)
    }
    setState('done')
  }

  const max = res ? Math.max(1, ...Object.values(res.dpe.dist)) : 1

  return (
    <Box title="Vérifier une adresse · données officielles en direct" right={<span className="text-[11.5px] text-slate-500">IGN · ADEME · Géorisques</span>}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run()
        }}
        className="flex gap-2"
      >
        <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-300 px-2.5">
          <MapPin size={15} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Adresse d’un immeuble" className="w-full py-1.5 text-[13.5px] outline-none" />
        </div>
        <button className="btn-primary" disabled={state === 'loading'}>
          {state === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Interroger
        </button>
      </form>
      <p className="mt-1.5 text-[12px] text-slate-500">Saisissez l’adresse de l’immeuble d’un visiteur : l’outil retrouve les DPE officiels enregistrés à moins de 30 m.</p>

      {res && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-[12.5px]">
            <span className="font-medium text-slate-800">{res.geo.label}</span>
            {offline ? (
              <span className="flex items-center gap-1 text-amber-700">
                <WifiOff size={13} /> hors ligne : données en cache
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 size={13} /> réponse en {res.ms} ms
              </span>
            )}
          </div>

          <div>
            <div className="mb-1.5 text-[12px] font-semibold text-slate-700">{res.dpe.total} DPE enregistrés à proximité</div>
            <div className="flex h-24 items-end gap-1.5">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l) => {
                const n = res.dpe.dist[l] ?? 0
                return (
                  <div key={l} className="flex flex-1 flex-col items-center gap-0.5">
                    <span className="text-[11px] tabular-nums text-slate-600">{n || ''}</span>
                    <div className="w-full rounded-t" style={{ height: `${(n / max) * 64 + 2}px`, background: DPE_COLORS[l as 'A'] }} />
                    <span className="text-[11px] font-bold text-slate-600">{l}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-1 font-medium">N° DPE</th>
                <th className="py-1 font-medium">Logement</th>
                <th className="py-1 font-medium">Étiquette</th>
                <th className="py-1 font-medium">Valide jusqu’au</th>
              </tr>
            </thead>
            <tbody>
              {res.dpe.rows.slice(0, 5).map((r) => (
                <tr key={r.numero} className="border-b border-slate-100">
                  <td className="py-1 font-mono text-[11.5px] text-slate-600">{r.numero}</td>
                  <td className="py-1 text-slate-700">
                    {r.surface ? `${Math.round(r.surface)} m²` : ''} {r.etage ? `· ${r.etage}` : ''}
                  </td>
                  <td className="py-1">
                    <span className="rounded px-1.5 font-bold text-white" style={{ background: DPE_COLORS[r.etiquette as 'A'] ?? '#94a3b8' }}>
                      {r.etiquette}
                    </span>{' '}
                    <span className="text-slate-500">{r.conso ? `${Math.round(r.conso)} kWh` : ''}</span>
                  </td>
                  <td className="py-1 text-slate-600">{r.validite ? fmtDate(r.validite) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!!res.risks.length && (
            <div>
              <div className="mb-1 text-[12px] font-semibold text-slate-700">Risques recensés sur la commune (Géorisques)</div>
              <div className="flex flex-wrap gap-1">
                {res.risks.map((r) => (
                  <span key={r} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11.5px] text-slate-600">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Box>
  )
}

function IrlCard() {
  const toast = useStore((s) => s.toast)
  const [pts, setPts] = useState<IrlPoint[] | null>(null)
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    try {
      setPts(await irlSeries(5))
      setOffline(false)
    } catch {
      setPts(OFFLINE_SAMPLE.irl)
      setOffline(true)
    }
    setLoading(false)
  }
  const last = pts?.[0]
  const yearAgo = pts?.[4]
  return (
    <Box
      title="INSEE · Indice de référence des loyers"
      right={
        <button onClick={load} className="btn-secondary !py-1">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Synchroniser
        </button>
      }
    >
      {!pts ? (
        <p className="text-[12.5px] text-slate-500">
          Valeur utilisée actuellement : <b className="text-slate-800">{IRL.label} = {IRL.value}</b> (publiée le {IRL.published}). Cliquez sur « Synchroniser » pour interroger l’INSEE en direct (série 001515333).
        </p>
      ) : (
        <>
          <div className="flex items-end gap-2">
            {[...pts].reverse().map((p) => (
              <div key={p.period} className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-center">
                <div className="text-[11px] text-slate-500">{p.period.replace('-Q', ' T')}</div>
                <div className={`text-[15px] font-semibold tabular-nums ${p === last ? 'text-blue-700' : 'text-slate-800'}`}>{p.value.toFixed(2).replace('.', ',')}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className={offline ? 'text-amber-700' : 'text-emerald-700'}>
              {offline ? 'Hors ligne : dernière valeur connue' : `Publié au JO le ${last ? fmtDate(last.jo) : ''}`}
              {last && yearAgo ? ` · variation sur un an : +${(((last.value / yearAgo.value) - 1) * 100).toFixed(2).replace('.', ',')} %` : ''}
            </span>
            <button
              onClick={() => toast({ tone: 'success', title: 'Révisions recalculées', body: 'Les lots dont la date anniversaire est passée ont été mis à jour (F et G exclus).' })}
              className="font-medium text-blue-700 hover:underline"
            >
              Recalculer les révisions
            </button>
          </div>
        </>
      )}
    </Box>
  )
}

export function ConnecteursPage() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <Box
          title="Architecture : ce à quoi l’outil est connecté"
          right={
            <div className="flex gap-4 text-[11.5px] text-slate-600">
              {(Object.keys(KIND) as Kind[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-5" style={{ background: KIND[k].stroke }} /> {KIND[k].label}
                </span>
              ))}
            </div>
          }
        >
          <Diagram />
        </Box>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <AddressCheck />
          </div>
          <div className="col-span-5 space-y-4">
            <IrlCard />
            <Box title="D’où viennent les réponses de l’outil">
              <ul className="space-y-2 text-[12.5px] text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-slate-900" />
                  <span>
                    <b>Vos données</b> : baux, quittances, relevés bancaires, tickets, devis.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-600" />
                  <span>
                    <b>Données publiques</b> : ADEME (DPE), INSEE (IRL), IGN (adresses), Géorisques.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                  <span>
                    <b>Textes officiels</b> : loi Climat et Résilience, loi du 6 juillet 1989, service-public.fr.
                  </span>
                </li>
              </ul>
              <div className="mt-3 flex items-start gap-2 rounded-md bg-slate-50 p-2.5 text-[12px] text-slate-600">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-slate-500" />
                Chaque réponse affiche ses sources. Les calculs réglementaires (gel des loyers, interdictions) sont des règles écrites et testées, pas des devinettes.
              </div>
            </Box>
          </div>
        </div>
      </div>
    </div>
  )
}
