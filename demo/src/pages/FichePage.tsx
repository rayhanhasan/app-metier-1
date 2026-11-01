import { ArrowRight, Check, Eye, Minus, Plug, Printer, X, Zap } from 'lucide-react'
import { MAKER } from '../config'
import { GROUPS, RIVAL, RIVAL_STRENGTHS, SOURCES, type Mark } from '../data/comparatif'
import { DPE_COLORS } from '../lib/utils'

// Fiche A4 recto verso (794 × 1123 px = 210 × 297 mm à 96 dpi)
const SHEET = 'relative mx-auto flex h-[1123px] w-[794px] flex-col overflow-hidden bg-white text-slate-800 shadow-xl print:shadow-none'

function Stat({ value, label, src }: { value: string; label: string; src: string }) {
  return (
    <div className="flex-1 border-l-2 border-slate-900 pl-3">
      <div className="text-[26px] font-bold leading-none tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-[11.5px] leading-snug text-slate-700">{label}</div>
      <div className="mt-0.5 text-[9.5px] text-slate-400">{src}</div>
    </div>
  )
}

function Recto() {
  const steps = [
    { icon: Plug, t: 'Connecter', d: 'Votre logiciel actuel + les données publiques. Sans migration.' },
    { icon: Eye, t: 'Voir', d: 'Le parc en 3D, chaque lot coloré par statut. Les urgences en une liste.' },
    { icon: Zap, t: 'Agir', d: 'Relance, révision, devis, annonce : un clic, tracé et daté.' },
  ]
  const sources = {
    public: ['ADEME · DPE', 'INSEE · IRL', 'IGN · adresses', 'Géorisques', 'Légifrance'],
    partners: ['Banque (DSP2)', 'Signature élec.', 'Recommandé élec.', 'SMS / e-mail', 'Portails'],
  }
  return (
    <div className={SHEET}>
      {/* En-tête */}
      <div className="bg-slate-900 px-10 pb-4 pt-5 text-white">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
          <span>Application métier sur mesure</span>
          <span>Gestion locative · ADB · SCI</span>
        </div>
        <div className="mt-3 text-[32px] font-bold leading-[1.05] tracking-tight">
          Votre parc locatif,
          <br />
          vos urgences, <span className="text-blue-400">en un seul écran.</span>
        </div>
        <div className="mt-2 max-w-[600px] text-[13px] leading-snug text-slate-300">
          Votre logiciel compte vos loyers. Atlas vous dit quoi faire ce matin, chiffré en euros, avec les données officielles à jour.
        </div>
      </div>

      {/* Capture */}
      <div className="relative px-10 pt-5">
        <div className="h-[244px] overflow-hidden rounded-md border border-slate-200 shadow-sm">
          <img src="./fiche/cap_plan.jpg" alt="Plan 3D du parc et liste des actions du jour" className="w-full" />
        </div>
        {[
          { n: 1, x: 80, y: 82, t: 'Actions du jour, triées par montant' },
          { n: 2, x: 372, y: 104, t: 'Lot cliquable : bail, loyer, DPE' },
          { n: 3, x: 352, y: 10, t: 'Questions en français, sources citées' },
        ].map((c) => (
          <div key={c.n} className="absolute flex items-center gap-1.5" style={{ left: 40 + c.x, top: 20 + c.y }}>
            <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white ring-2 ring-white">{c.n}</span>
            <span className="rounded bg-slate-900/90 px-2 py-0.5 text-[10.5px] font-medium text-white">{c.t}</span>
          </div>
        ))}
      </div>

      {/* Constat */}
      <div className="px-10 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Le constat</div>
        <div className="mt-2.5 flex items-end gap-5">
          <div className="flex-[1.15]">
            <div className="flex h-[58px] items-end gap-2">
              {[
                { y: '2023', v: 1494 },
                { y: '2024', v: 1303 },
                { y: '2025', v: 1147 },
              ].map((b) => (
                <div key={b.y} className="flex flex-1 flex-col items-center">
                  <span className="text-[10px] font-semibold text-slate-700">{(b.v / 1000).toFixed(2).replace('.', ',')} M</span>
                  <div className="w-full rounded-t-sm" style={{ height: `${(b.v / 1494) * 36}px`, background: b.y === '2025' ? DPE_COLORS.G : '#cbd5e1' }} />
                  <span className="text-[10px] text-slate-500">{b.y}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-[11.5px] leading-snug text-slate-700">logements F ou G dans le parc locatif privé, au 1er janvier</div>
            <div className="text-[9.5px] text-slate-400">SDES / ONRE, nov. 2025</div>
          </div>
          <Stat value="41 %" label="des bailleurs ont déjà subi un impayé" src="Galian-SMABTP / ViaVoice 2026" />
          <Stat value="22 %" label="des propriétaires attendent plus d’une semaine une réponse de leur agence" src="Enquête IAD, agences parisiennes, mai 2026" />
        </div>
      </div>

      {/* Calendrier */}
      <div className="px-10 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">L’échéance qui ne bougera pas : interdiction de louer</div>
        <div className="mt-3 flex items-stretch">
          {[
            { y: '2025', l: 'G' as const, t: 'déjà interdit' },
            { y: '2028', l: 'F' as const, t: 'dans 14 mois' },
            { y: '2034', l: 'E' as const, t: 'à planifier' },
          ].map((s, i) => (
            <div key={s.y} className="flex flex-1 items-center">
              <div className="flex flex-1 items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
                <span className="grid size-9 place-items-center rounded text-[18px] font-bold text-white" style={{ background: DPE_COLORS[s.l] }}>
                  {s.l}
                </span>
                <div>
                  <div className="text-[17px] font-bold leading-none text-slate-900">1er janv. {s.y}</div>
                  <div className="text-[11px] text-slate-500">{s.t}</div>
                </div>
              </div>
              {i < 2 && <ArrowRight size={16} className="mx-1.5 shrink-0 text-slate-300" />}
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-[9.5px] text-slate-400">Loi n° 2021-1104 Climat et Résilience, art. 160. Loyers des F et G gelés depuis le 24/08/2022 (art. 159).</div>
      </div>

      {/* Comment ça marche + connecteurs */}
      <div className="grid grid-cols-2 gap-6 px-10 pt-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Comment ça marche</div>
          <div className="mt-2 space-y-2">
            {steps.map((s, i) => (
              <div key={s.t} className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
                  <s.icon size={16} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">
                    {i + 1}. {s.t}
                  </div>
                  <div className="text-[11.5px] leading-snug text-slate-600">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Branché sur</div>
          <div className="mt-2.5 rounded-md border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col gap-1">
                {sources.public.map((s) => (
                  <span key={s} className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-800">
                    {s}
                  </span>
                ))}
              </div>
              <div className="grid h-[86px] w-[74px] shrink-0 place-items-center rounded-md bg-slate-900 text-center text-[13px] font-bold leading-tight text-white">
                Atlas
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {sources.partners.map((s) => (
                  <span key={s} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-center text-[10.5px] font-medium text-blue-800">Votre logiciel actuel · import CSV / FEC / API</div>
            <div className="mt-1.5 flex gap-3 text-[9.5px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-emerald-500" /> API publiques, en direct
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-slate-400" /> services partenaires
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offre */}
      <div className="mt-auto border-t border-slate-200 bg-slate-50 px-10 py-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { t: 'Jumeau Express', p: '2 900 – 4 900 € HT', d: 'Prototype 3D sur vos données, 2 semaines. Déductible.' },
            { t: 'Version métier', p: '12 000 – 25 000 € HT', d: 'Alertes, échéancier, quittances, imports, multi-utilisateurs.' },
            { t: 'Sérénité', p: '150 – 450 € / mois', d: 'Hébergement en France, maintenance, évolutions.' },
          ].map((o, i) => (
            <div key={o.t} className={`rounded-md border p-3 ${i === 0 ? 'border-blue-600 bg-white' : 'border-slate-200 bg-white'}`}>
              <div className="text-[12.5px] font-semibold text-slate-900">{o.t}</div>
              <div className="text-[15px] font-bold text-blue-700">{o.p}</div>
              <div className="mt-0.5 text-[10.5px] leading-snug text-slate-600">{o.d}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px]">
          <span className="font-semibold text-slate-900">
            {MAKER.name} · <span className="font-normal text-slate-600">{MAKER.activity}</span>
          </span>
          <span className="text-slate-700">
            {MAKER.phone} · {MAKER.email}
          </span>
        </div>
      </div>
    </div>
  )
}

function MarkCell({ m }: { m: Mark }) {
  if (m === 'oui')
    return (
      <span className="inline-grid size-[17px] place-items-center rounded-full bg-emerald-600 text-white">
        <Check size={11} strokeWidth={3} />
      </span>
    )
  if (m === 'partiel')
    return (
      <span className="inline-grid size-[17px] place-items-center rounded-full bg-amber-400 text-white">
        <Minus size={11} strokeWidth={3} />
      </span>
    )
  if (m === 'non')
    return (
      <span className="inline-grid size-[17px] place-items-center rounded-full bg-slate-300 text-white">
        <X size={10} strokeWidth={3} />
      </span>
    )
  return <span className="text-[10px] font-medium text-slate-400">non mentionné</span>
}

function Verso() {
  return (
    <div className={SHEET}>
      <div className="px-10 pt-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Comparatif · informations publiques au {RIVAL.checkedOn}</div>
        <div className="mt-1.5 text-[24px] font-bold leading-tight tracking-tight text-slate-900">
          Atlas <span className="font-normal text-slate-400">et</span> {RIVAL.name} <span className="text-[16px] font-medium text-slate-500">({RIVAL.editor})</span>
        </div>
        <div className="mt-1 text-[13.5px] text-slate-600">Complémentaires : {RIVAL.name} tient la comptabilité de gérance, Atlas pilote le quotidien et l’échéance DPE.</div>
      </div>

      {/* Tableau */}
      <div className="px-10 pt-4">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left">
              <th className="py-1.5 pr-2 font-semibold text-slate-900">Fonctionnalité</th>
              <th className="w-[84px] py-1.5 text-center font-semibold text-blue-700">Atlas</th>
              <th className="w-[84px] py-1.5 text-center font-semibold text-slate-700">{RIVAL.name}</th>
            </tr>
          </thead>
          {GROUPS.map((g) => (
            <tbody key={g.title}>
              <tr>
                <td colSpan={3} className="pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {g.title}
                </td>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.label} className="border-b border-slate-100">
                  <td className="py-[2.5px] pr-2 text-slate-800">
                    {r.label}
                    {r.note && <span className="text-slate-400"> · {r.note}</span>}
                    {r.src && <sup className="ml-0.5 text-[8.5px] text-slate-400">[{r.src.join(',')}]</sup>}
                  </td>
                  <td className="py-[2.5px] text-center">
                    <MarkCell m={r.atlas} />
                  </td>
                  <td className="py-[2.5px] text-center">
                    <MarkCell m={r.rival} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9.5px] text-slate-500">
          <span className="flex items-center gap-1">
            <MarkCell m="oui" /> oui
          </span>
          <span className="flex items-center gap-1">
            <MarkCell m="partiel" /> partiel
          </span>
          <span className="flex items-center gap-1">
            <MarkCell m="non" /> non
          </span>
          <span>« non mentionné » : absent de la documentation publique consultée, ce qui ne prouve pas l’absence de la fonction.</span>
        </div>
      </div>

      {/* Schéma de complémentarité + points forts */}
      <div className="grid grid-cols-2 gap-6 px-10 pt-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Comment les deux s’empilent</div>
          <div className="mt-2.5 space-y-1.5">
            <div className="rounded-md bg-blue-700 px-3 py-2 text-white">
              <div className="text-[12.5px] font-semibold">Atlas · pilotage</div>
              <div className="text-[10.5px] text-blue-100">Plan 3D · alertes chiffrées · DPE 2025-2034 · gel F/G · ADEME, INSEE, IGN</div>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <span className="h-px flex-1 bg-slate-300" /> lit vos exports (CSV, FEC) · aucune migration <span className="h-px flex-1 bg-slate-300" />
            </div>
            <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
              <div className="text-[12.5px] font-semibold text-slate-800">Votre logiciel de gérance · {RIVAL.name} ou autre</div>
              <div className="text-[10.5px] text-slate-500">Comptabilité mandant · quittancement · règlements propriétaires · extranets</div>
            </div>
            <div className="rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-[10.5px] text-slate-500">Banque · signature · recommandé électronique · portails d’annonces</div>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ce que {RIVAL.name} fait bien</div>
          <ul className="mt-2.5 space-y-1.5 text-[11px] leading-snug text-slate-700">
            {RIVAL_STRENGTHS.map((s) => (
              <li key={s.text} className="flex gap-2">
                <Check size={13} className="mt-0.5 shrink-0 text-slate-500" />
                <span>
                  {s.text}
                  <sup className="ml-0.5 text-[8.5px] text-slate-400">[{s.src.join(',')}]</sup>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-md bg-blue-50 p-2.5 text-[11px] leading-snug text-blue-900">
            <b>Notre réponse :</b> gardez votre logiciel pour la comptabilité. Atlas part de vos exports et ajoute la couche qui manque, pour un prix affiché et sans engagement de migration.
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="mt-auto border-t border-slate-200 px-10 py-3 text-[8.5px] leading-snug text-slate-500">
        <div className="mb-1 font-semibold text-slate-600">Sources (consultées le {RIVAL.checkedOn})</div>
        {SOURCES.map((s) => (
          <div key={s.n}>
            [{s.n}] {s.label} · {s.url}
          </div>
        ))}
        <div className="mt-1.5 text-slate-400">
          Comparaison établie à partir des seules informations publiques de l’éditeur, sans accès au logiciel, et susceptible d’évoluer. {RIVAL.name} et {RIVAL.editor} sont des marques de leurs détenteurs respectifs. Les fonctions indiquées pour Atlas
          sont celles de la démonstration présentée sur le stand.
        </div>
      </div>
    </div>
  )
}

/** Les deux pages seules (utilisé pour l'impression / le PDF via ?fiche) */
export function FicheSheets() {
  return (
    <div className="fiche-print space-y-6 bg-slate-200 py-6 print:space-y-0 print:bg-white print:py-0">
      <Recto />
      <div className="print:break-before-page" />
      <Verso />
    </div>
  )
}

export function FichePage() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-200">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-300 bg-white/95 px-5 py-2.5">
        <div className="text-[13px] text-slate-600">Fiche A4 recto verso à remettre sur le stand. Le comparatif est sourcé et daté.</div>
        <button onClick={() => window.open('?fiche', '_blank')} className="btn-primary !py-1.5">
          <Printer size={15} /> Ouvrir pour impression (PDF)
        </button>
      </div>
      <div className="origin-top py-6 [zoom:0.9]">
        <FicheSheets />
      </div>
    </div>
  )
}
