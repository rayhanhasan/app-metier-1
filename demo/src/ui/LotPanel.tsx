import { useMemo } from 'react'
import { Banknote, Box, CalendarClock, FileText, Flame, Hammer, Mail, Megaphone, Phone, Receipt, Send, ShieldCheck, User, Wrench, X } from 'lucide-react'
import { useSelectedLot, useStore } from '../store'
import { buildingById } from '../data/portfolio'
import type { Lot } from '../data/types'
import { CURRENT_YEAR, DPE_COLORS, DPE_RANGES, banYear, daysFromToday, fmtDate, fmtEur, fmtMonth, irlGain, isBanned, renovationPlan, rentFrozen } from '../lib/utils'
import { IRL } from '../config'

const STATUS: Record<Lot['status'], { label: string; cls: string }> = {
  loue: { label: 'Loué', cls: 'bg-blue-50 text-blue-700' },
  vacant: { label: 'Vacant', cls: 'bg-slate-100 text-slate-700' },
  preavis: { label: 'Préavis en cours', cls: 'bg-amber-50 text-amber-700' },
  travaux: { label: 'En travaux', cls: 'bg-violet-50 text-violet-700' },
}
const PAY = {
  ok: { label: 'À jour', cls: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  retard: { label: 'Retard', cls: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  impaye: { label: 'Impayé', cls: 'bg-red-50 text-red-700', bar: 'bg-red-500' },
}

function Section({ icon: Icon, title, children, right }: { icon: typeof User; title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
          <Icon size={14} /> {title}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-[13.5px]">
      <span className="text-slate-500">{k}</span>
      <span className={`text-right ${strong ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{v}</span>
    </div>
  )
}

function DpeScale({ letter }: { letter: Lot['dpe']['letter'] }) {
  return (
    <div className="flex gap-1">
      {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const).map((l) => (
        <div
          key={l}
          className={`grid h-7 flex-1 place-items-center rounded-md text-[12px] font-bold text-white transition-all ${l === letter ? 'scale-y-125 shadow-md ring-2 ring-slate-900' : 'opacity-35'}`}
          style={{ background: DPE_COLORS[l] }}
        >
          {l}
        </div>
      ))}
    </div>
  )
}

export function LotPanel({ embedded = false }: { embedded?: boolean }) {
  const lot = useSelectedLot()
  const select = useStore((s) => s.select)
  const toast = useStore((s) => s.toast)
  const openModal = useStore((s) => s.openModal)
  const updateLot = useStore((s) => s.updateLot)
  const markDone = useStore((s) => s.markDone)
  const plan = useMemo(() => (lot ? renovationPlan(lot) : null), [lot])

  if (!lot) return null
  const b = buildingById[lot.buildingId]
  const ban = banYear(lot.dpe.letter)
  const banned = isBanned(lot.dpe.letter, CURRENT_YEAR)
  const gain = irlGain(lot)
  const occupied = lot.status === 'loue' || lot.status === 'preavis'

  const relance = () => {
    toast({ tone: 'success', title: `Relance envoyée à ${lot.tenant?.name}`, body: 'SMS + e-mail avec lien de paiement. Escalade automatique à J+8.' })
    markDone(`impaye-${lot.id}`)
    markDone(`retard-${lot.id}`)
  }

  return (
    <div key={lot.id} className={`panel panel-in pointer-events-auto flex max-h-full flex-col overflow-hidden rounded-lg ${embedded ? 'h-full w-full' : 'w-[380px]'}`}>
      {/* En-tête */}
      <div className="relative px-4 pb-3 pt-3.5">
        <button onClick={() => (embedded ? useStore.setState({ selectedId: null }) : select(null))} className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X size={18} />
        </button>
        <div className="text-[11.5px] font-medium text-slate-500">
          {b.name} · {b.address}
        </div>
        <div className="mt-1 flex items-end gap-2">
          <div className="text-[20px] font-semibold leading-none text-slate-900">{lot.label}</div>
          <div className="pb-0.5 text-[14px] text-slate-500">
            {lot.typology} · {lot.surface} m² · {lot.floor === 0 ? 'RDC' : `${lot.floor}e étage`}
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className={`rounded px-2 py-0.5 text-[12px] font-semibold ${STATUS[lot.status].cls}`}>{STATUS[lot.status].label}</span>
          {occupied && <span className={`rounded px-2 py-0.5 text-[12px] font-semibold ${PAY[lot.payment].cls}`}>Loyer : {PAY[lot.payment].label}</span>}
          <span className="rounded px-2 py-0.5 text-[12px] font-bold text-white" style={{ background: DPE_COLORS[lot.dpe.letter] }}>
            DPE {lot.dpe.letter}
          </span>
          {banned && occupied && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[12px] font-semibold text-white">Non décent</span>}
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto">
        {/* Locataire */}
        {lot.tenant ? (
          <Section icon={User} title="Locataire">
            <div className="text-[16px] font-semibold text-slate-900">{lot.tenant.name}</div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {lot.tenant.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {lot.tenant.email}
              </span>
            </div>
            <div className="mt-2">
              <Row k="Bail" v={lot.lease?.type} />
              <Row k="Entrée" v={fmtDate(lot.tenant.since)} />
              <Row k={lot.status === 'preavis' ? 'Départ' : 'Échéance'} v={`${fmtDate(lot.noticeEnd ?? lot.lease!.end)} · ${daysFromToday(lot.noticeEnd ?? lot.lease!.end)} j`} />
              <Row k="Garantie" v={lot.tenant.guarantor} />
              <Row k="Propriétaire" v={lot.owner} />
            </div>
          </Section>
        ) : (
          <Section icon={User} title="Occupation">
            <div className="text-[14px] text-slate-700">
              {lot.status === 'vacant' ? (
                <>
                  Vacant depuis <b>{lot.vacantSince ? -daysFromToday(lot.vacantSince) : 0} jours</b> · manque à gagner{' '}
                  <b className="text-red-600">{fmtEur((lot.rent / 30) * (lot.vacantSince ? -daysFromToday(lot.vacantSince) : 0))}</b>
                </>
              ) : (
                'Rafraîchissement en cours avant remise en location.'
              )}
            </div>
            <Row k="Propriétaire" v={lot.owner} />
          </Section>
        )}

        {/* Finances */}
        <Section
          icon={Banknote}
          title="Loyer"
          right={occupied ? <span className="text-[12px] text-slate-500">6 derniers mois</span> : undefined}
        >
          <Row k="Loyer hors charges" v={fmtEur(lot.rent)} strong />
          <Row k="Provisions sur charges" v={fmtEur(lot.charges)} />
          {occupied && (
            <Row k="Solde locataire" v={<span className={lot.balance < 0 ? 'font-bold text-red-600' : 'text-emerald-600'}>{lot.balance < 0 ? fmtEur(lot.balance) : 'À jour'}</span>} />
          )}
          {occupied && (
            <div className="mt-3 flex items-end gap-1.5">
              {lot.history.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`w-full rounded-md ${PAY[h].bar}`} style={{ height: h === 'ok' ? 30 : h === 'retard' ? 20 : 8, opacity: h === 'ok' ? 0.85 : 1 }} />
                  <span className="text-[10.5px] text-slate-400">{fmtMonth(i - 5)}</span>
                </div>
              ))}
            </div>
          )}
          {occupied && lot.typology !== 'Commerce' && (
            <div className={`mt-3 rounded-md px-3 py-2 text-[12.5px] ${gain > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
              {rentFrozen(lot.dpe.letter)
                ? 'Révision IRL impossible : loyer gelé (logement F ou G, loi Climat).'
                : gain > 0
                  ? `Révision ${IRL.label} disponible : +${fmtEur(gain)}/mois (+${fmtEur(gain * 12)}/an).`
                  : lot.lease?.revised
                    ? 'Loyer révisé cette année.'
                    : `Prochaine révision le ${fmtDate(lot.lease!.revisionDate)}.`}
            </div>
          )}
        </Section>

        {/* DPE */}
        <Section icon={Flame} title="Performance énergétique">
          <DpeScale letter={lot.dpe.letter} />
          <div className="mt-2.5">
            <Row k="Consommation" v={`${lot.dpe.kwh} kWh/m²/an (${DPE_RANGES[lot.dpe.letter]})`} />
            <Row k="DPE réalisé le" v={fmtDate(lot.dpe.date)} />
            <Row
              k="Statut location"
              v={
                ban ? (
                  <span className={banned ? 'font-bold text-red-600' : 'font-semibold text-amber-600'}>
                    {banned ? `Interdit depuis le 01/01/${ban}` : `Interdit au 01/01/${ban}`}
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-600">Conforme</span>
                )
              }
            />
          </div>
          {plan && (
            <div className={`mt-3 rounded-md border p-3 ${banned ? 'border-red-200 bg-red-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
              <div className="text-[13px] font-semibold text-slate-900">
                Plan recommandé : {lot.dpe.letter} → {plan.target}
              </div>
              <ul className="mt-1 list-inside list-disc text-[12.5px] text-slate-600">
                {plan.works.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-lg bg-white px-2 py-1.5">
                  <div className="text-slate-500">Budget estimé</div>
                  <div className="text-[14px] font-bold text-slate-900">{fmtEur(plan.cost)}</div>
                </div>
                <div className="rounded-lg bg-white px-2 py-1.5">
                  <div className="text-slate-500">Loyers sécurisés</div>
                  <div className="text-[14px] font-bold text-emerald-700">{fmtEur(plan.annualRent)}/an</div>
                </div>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500">Estimation indicative avant aides (MaPrimeRénov’, CEE) et audit énergétique.</div>
            </div>
          )}
        </Section>

        {/* Interventions */}
        <Section icon={Hammer} title="Interventions">
          {lot.interventions.length === 0 && <div className="text-[13px] text-slate-500">Aucune intervention en cours.</div>}
          <div className="space-y-2">
            {lot.interventions.map((i) => (
              <div key={i.id} className="rounded-md border border-slate-200 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-slate-900">{i.title}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-slate-500">
                  <Wrench size={12} /> {i.trade} · {i.company}
                  {i.cost ? ` · ${fmtEur(i.cost)}` : ''}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11.5px] font-semibold ${
                      i.status === 'en_cours' ? 'bg-violet-50 text-violet-700' : i.status === 'devis' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {i.status === 'en_cours' ? 'En cours' : i.status === 'devis' ? 'Devis à valider' : `Planifiée · ${fmtDate(i.date)}`}
                  </span>
                  {i.note && <span className="truncate text-[11.5px] text-slate-400">{i.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={ShieldCheck} title="Documents">
          <div className="grid grid-cols-2 gap-1.5 text-[12.5px]">
            {['Bail signé', 'État des lieux', 'Attestation assurance', lot.diagExpired ? 'Diagnostics (à renouveler)' : 'Diagnostics'].map((d) => (
              <div key={d} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${d.includes('renouveler') ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-700'}`}>
                <FileText size={13} /> {d}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-200/70 bg-white/60 p-3">
        {lot.payment !== 'ok' && occupied && (
          <button onClick={relance} className="btn-primary">
            <Send size={15} /> Relancer
          </button>
        )}
        {lot.payment === 'ok' && occupied && (
          <button onClick={() => openModal({ kind: 'quittance', lotId: lot.id })} className="btn-primary">
            <Receipt size={15} /> Quittance
          </button>
        )}
        {lot.status === 'vacant' && (
          <button onClick={() => openModal({ kind: 'annonce', lotId: lot.id })} className="btn-primary">
            <Megaphone size={15} /> Publier l’annonce
          </button>
        )}
        {lot.status === 'travaux' && (
          <button onClick={() => toast({ tone: 'info', title: 'Photos de chantier reçues', body: 'Atelier Couleurs : avancement 70 %, fin prévue vendredi.' })} className="btn-primary">
            <CalendarClock size={15} /> Avancement
          </button>
        )}
        {embedded && (
          <button
            onClick={() => {
              useStore.getState().setPage('plan')
              select(lot.id)
            }}
            className="btn-secondary col-span-2"
          >
            <Box size={15} /> Voir sur le plan 3D
          </button>
        )}
        <button onClick={() => openModal({ kind: 'intervention', lotId: lot.id })} className="btn-secondary">
          <Wrench size={15} /> Intervention
        </button>
        {gain > 0 && (
          <button
            onClick={() => {
              updateLot(lot.id, { lease: { ...lot.lease!, revised: true } })
              toast({ tone: 'success', title: 'Avis de révision envoyé', body: `+${fmtEur(gain)}/mois à partir de la prochaine échéance.` })
            }}
            className="btn-secondary col-span-2"
          >
            Appliquer la révision IRL (+{fmtEur(gain)}/mois)
          </button>
        )}
        {plan && (
          <button
            onClick={() => toast({ tone: 'success', title: 'Demande de devis envoyée', body: '3 entreprises RGE sollicitées. Réponses attendues sous 7 jours.' })}
            className="btn-secondary col-span-2"
          >
            <Flame size={15} /> Lancer le plan de rénovation
          </button>
        )}
      </div>
    </div>
  )
}
