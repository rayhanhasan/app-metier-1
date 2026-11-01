import { useState } from 'react'
import { CheckCircle2, Info, Megaphone, Printer, TriangleAlert, Wrench, X } from 'lucide-react'
import { useStore } from '../store'
import { buildingById } from '../data/portfolio'
import type { Intervention } from '../data/types'
import { BRAND } from '../config'
import { TODAY, fmtDate, fmtEur } from '../lib/utils'

// ── Notifications ──────────────────────────────────────────────
export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[360px] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'warning' ? TriangleAlert : Info
        const color = t.tone === 'success' ? 'text-emerald-600' : t.tone === 'warning' ? 'text-amber-600' : 'text-blue-600'
        return (
          <div key={t.id} className="panel toast-in pointer-events-auto flex gap-3 rounded-lg p-3.5 shadow-xl">
            <Icon size={20} className={`mt-0.5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-slate-900">{t.title}</div>
              {t.body && <div className="mt-0.5 text-[13px] text-slate-600">{t.body}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="self-start text-slate-400 hover:text-slate-700">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Modal({ title, icon: Icon, children, onClose, wide }: { title: string; icon: typeof X; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-900/30 p-6 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`panel-in max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-[16px] font-bold text-slate-900">
            <Icon size={18} className="text-blue-600" /> {title}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Quittance ─────────────────────────────────────────────────
function Quittance({ lotId, onClose }: { lotId: string; onClose: () => void }) {
  const lot = useStore((s) => s.lots.find((l) => l.id === lotId))!
  const toast = useStore((s) => s.toast)
  const b = buildingById[lot.buildingId]
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(TODAY)
  return (
    <Modal title="Quittance de loyer" icon={Printer} onClose={onClose} wide>
      <div className="p-6">
        <div className="rounded-lg border border-slate-200 p-6 font-[Georgia,serif] text-[14px] leading-relaxed text-slate-800 shadow-inner">
          <div className="flex justify-between">
            <div>
              <div className="font-sans text-[15px] font-bold text-blue-700">{BRAND.agency}</div>
              <div className="font-sans text-[12px] text-slate-500">Administrateur de biens · mandataire de {lot.owner}</div>
            </div>
            <div className="text-right font-sans text-[12px] text-slate-500">N° Q-{TODAY.getFullYear()}-{lot.id}</div>
          </div>
          <div className="mt-5 text-center font-sans text-[18px] font-bold uppercase tracking-wide">Quittance de loyer — {month}</div>
          <p className="mt-4">
            Je soussigné(e), {BRAND.agency}, agissant pour le compte de {lot.owner}, propriétaire du logement situé au <b>{b.address}</b>, {BRAND.city}, lot {lot.id} ({lot.typology}, {lot.surface} m²), déclare avoir reçu de <b>{lot.tenant?.name}</b> la somme de{' '}
            <b>{fmtEur(lot.rent + lot.charges)}</b> au titre du loyer et des charges pour la période de {month}, et lui en donne quittance, sous réserve de tous mes droits.
          </p>
          <table className="mt-4 w-full font-sans text-[13px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1.5">Loyer hors charges</td>
                <td className="text-right tabular-nums">{fmtEur(lot.rent)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5">Provisions sur charges</td>
                <td className="text-right tabular-nums">{fmtEur(lot.charges)}</td>
              </tr>
              <tr className="font-bold">
                <td className="py-1.5">Total réglé</td>
                <td className="text-right tabular-nums">{fmtEur(lot.rent + lot.charges)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-5 text-right font-sans text-[12px] text-slate-500">Fait à Lyon, le {fmtDate(TODAY.toISOString())}</div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={15} /> Imprimer
          </button>
          <button
            onClick={() => {
              toast({ tone: 'success', title: `Quittance envoyée à ${lot.tenant?.name}`, body: 'PDF signé, archivé dans le dossier du lot.' })
              onClose()
            }}
            className="btn-primary"
          >
            Envoyer au locataire
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Planifier une intervention ────────────────────────────────
const TRADES: { trade: Intervention['trade']; company: string; title: string; eta: string }[] = [
  { trade: 'Plombier', company: 'Dupont Plomberie', title: 'Dépannage plomberie', eta: '45 min' },
  { trade: 'Électricien', company: 'Elec’Rhône', title: 'Panne électrique', eta: '1 h 30' },
  { trade: 'Chauffagiste', company: 'Thermi’Rhône', title: 'Chauffage / eau chaude', eta: '2 h' },
  { trade: 'Serrurier', company: 'Clés Minute 69', title: 'Ouverture / serrure', eta: '30 min' },
]

function InterventionModal({ lotId, onClose }: { lotId: string; onClose: () => void }) {
  const lot = useStore((s) => s.lots.find((l) => l.id === lotId))!
  const dispatch = useStore((s) => s.dispatchArtisan)
  const toast = useStore((s) => s.toast)
  const setMode = useStore((s) => s.setMode)
  const [pick, setPick] = useState(0)
  return (
    <Modal title={`Intervention · ${lot.label}`} icon={Wrench} onClose={onClose}>
      <div className="space-y-2 p-6">
        <div className="mb-1 text-[13px] text-slate-500">Artisans partenaires disponibles aujourd’hui :</div>
        {TRADES.map((t, i) => (
          <button
            key={t.trade}
            onClick={() => setPick(i)}
            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${pick === i ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div>
              <div className="text-[14px] font-semibold text-slate-900">{t.trade}</div>
              <div className="text-[12.5px] text-slate-500">
                {t.company} · noté 4,{8 - i}/5
              </div>
            </div>
            <div className="text-right text-[12.5px] font-semibold text-emerald-600">Sur place en {t.eta}</div>
          </button>
        ))}
        <button
          onClick={() => {
            const t = TRADES[pick]
            dispatch(lot.id, t.trade, t.company, t.title)
            setMode('travaux')
            toast({ tone: 'success', title: `${t.company} est en route`, body: `${lot.tenant ? `${lot.tenant.name} prévenu(e) par SMS. ` : ''}Arrivée estimée dans ${t.eta}. Bon d’intervention généré.` })
            onClose()
          }}
          className="btn-primary mt-2 w-full"
        >
          Envoyer l’artisan
        </button>
      </div>
    </Modal>
  )
}

// ── Annonce générée ───────────────────────────────────────────
function Annonce({ lotId, onClose }: { lotId: string; onClose: () => void }) {
  const lot = useStore((s) => s.lots.find((l) => l.id === lotId))!
  const toast = useStore((s) => s.toast)
  const markDone = useStore((s) => s.markDone)
  const b = buildingById[lot.buildingId]
  return (
    <Modal title="Annonce rédigée automatiquement" icon={Megaphone} onClose={onClose} wide>
      <div className="p-6">
        <div className="rounded-lg border border-slate-200 p-5">
          <div className="text-[18px] font-bold text-slate-900">
            {lot.typology} lumineux de {lot.surface} m² — {BRAND.city}
          </div>
          <div className="mt-1 text-[22px] font-black text-blue-700">
            {fmtEur(lot.rent + lot.charges)} <span className="text-[13px] font-medium text-slate-500">CC / mois</span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
            Dans la {b.name.toLowerCase()} ({b.year}), au {lot.floor === 0 ? 'rez-de-chaussée' : `${lot.floor}e étage`}, bel appartement de {lot.surface} m² entièrement rafraîchi : séjour ouvert sur balcon, cuisine équipée, chambre au calme
            sur cour. Classe énergie {lot.dpe.letter}. Proche commerces, métro et parc. Disponible immédiatement.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
            {['Loyer : ' + fmtEur(lot.rent), 'Charges : ' + fmtEur(lot.charges), 'Dépôt de garantie : ' + fmtEur(lot.rent), `DPE ${lot.dpe.letter} · ${lot.dpe.kwh} kWh/m²/an`, 'Honoraires conformes loi ALUR'].map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 text-[13px] text-slate-500">Mentions obligatoires vérifiées. Diffusion sur 4 portails + préqualification automatique des candidats (dossier, solvabilité, garant).</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Modifier
          </button>
          <button
            onClick={() => {
              toast({ tone: 'success', title: 'Annonce publiée sur 4 portails', body: 'Premières visites proposées en créneaux groupés jeudi et samedi.' })
              markDone(`vacance-${lot.id}`)
              onClose()
            }}
            className="btn-primary"
          >
            <Megaphone size={15} /> Publier
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function Modals() {
  const modal = useStore((s) => s.modal)
  const openModal = useStore((s) => s.openModal)
  if (!modal) return null
  const close = () => openModal(null)
  if (modal.kind === 'quittance') return <Quittance lotId={modal.lotId} onClose={close} />
  if (modal.kind === 'intervention') return <InterventionModal lotId={modal.lotId} onClose={close} />
  return <Annonce lotId={modal.lotId} onClose={close} />
}
