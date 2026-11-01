import type { Lot, ViewMode } from './types'
import { buildingById } from './portfolio'
import { CURRENT_YEAR, banYear, daysFromToday, fmtEur, irlGain, isBanned, rentFrozen } from '../lib/utils'

export type Severity = 'critique' | 'important' | 'info'

export interface Alert {
  id: string
  severity: Severity
  kind: 'impaye' | 'dpe' | 'dpe-future' | 'irl' | 'bail' | 'vacance' | 'travaux' | 'diag' | 'devis' | 'regul'
  title: string
  detail: string
  impact?: string
  lotIds: string[]
  mode: ViewMode
  year?: number
  cta: string
}

const occupied = (l: Lot) => l.status === 'loue' || l.status === 'preavis'
const where = (l: Lot) => `${l.label} · ${buildingById[l.buildingId].name}`

/** Le « copilote » : transforme les données brutes en actions priorisées. */
export function computeAlerts(lots: Lot[]): Alert[] {
  const alerts: Alert[] = []

  // 1. Impayés
  for (const l of lots.filter((l) => l.payment === 'impaye')) {
    const months = l.history.filter((h) => h === 'impaye').length
    alerts.push({
      id: `impaye-${l.id}`,
      severity: 'critique',
      kind: 'impaye',
      title: `Impayé de ${months} mois — ${l.tenant?.name}`,
      detail: `${where(l)}. ${months >= 2 ? 'Mise en demeure recommandée et déclaration à la GLI avant J+60.' : 'Relance amiable automatique prête à partir.'}`,
      impact: fmtEur(-l.balance),
      lotIds: [l.id],
      mode: 'loyers',
      cta: months >= 2 ? 'Lancer la procédure' : 'Relancer',
    })
  }

  // 2. Logements déjà interdits à la location
  for (const l of lots.filter((l) => occupied(l) && isBanned(l.dpe.letter, CURRENT_YEAR))) {
    const endIn = l.lease ? daysFromToday(l.lease.end) : 0
    alerts.push({
      id: `dpe-${l.id}`,
      severity: 'critique',
      kind: 'dpe',
      title: `Passoire ${l.dpe.letter} : non décent depuis le 1er janv. ${banYear(l.dpe.letter)}`,
      detail: `${where(l)}. Échéance du bail dans ${endIn} jours : renouvellement impossible sans travaux. Loyer gelé.`,
      impact: `${fmtEur(l.rent * 12)}/an`,
      lotIds: [l.id],
      mode: 'dpe',
      cta: 'Voir le plan de travaux',
    })
  }

  // 3. Prochaine vague d'interdiction
  const nextBan = [2028, 2034].find((y) => y > CURRENT_YEAR) ?? 2034
  const atRisk = lots.filter((l) => occupied(l) && !isBanned(l.dpe.letter, CURRENT_YEAR) && isBanned(l.dpe.letter, nextBan))
  if (atRisk.length) {
    const letter = atRisk[0].dpe.letter
    alerts.push({
      id: `dpe-future-${nextBan}`,
      severity: 'important',
      kind: 'dpe-future',
      title: `${atRisk.length} logements ${letter} interdits à la location au 1er janv. ${nextBan}`,
      detail: `Anticiper les travaux maintenant pour lisser le budget et éviter la vacance.`,
      impact: `${fmtEur(atRisk.reduce((s, l) => s + l.rent * 12, 0))}/an à risque`,
      lotIds: atRisk.map((l) => l.id),
      mode: 'dpe',
      year: nextBan,
      cta: `Projeter en ${nextBan}`,
    })
  }

  // 4. Vacance
  for (const l of lots.filter((l) => l.status === 'vacant')) {
    const days = l.vacantSince ? -daysFromToday(l.vacantSince) : 0
    alerts.push({
      id: `vacance-${l.id}`,
      severity: 'important',
      kind: 'vacance',
      title: `Vacant depuis ${days} jours — ${l.typology} ${l.surface} m²`,
      detail: `${where(l)}. Annonce rédigée et prête à diffuser sur les portails.`,
      impact: `−${fmtEur((l.rent / 30) * days)}`,
      lotIds: [l.id],
      mode: 'occupation',
      cta: 'Publier l’annonce',
    })
  }

  // 5. Révisions IRL oubliées
  const irl = lots.filter((l) => irlGain(l) > 0)
  if (irl.length) {
    const gain = irl.reduce((s, l) => s + irlGain(l), 0)
    alerts.push({
      id: 'irl',
      severity: 'important',
      kind: 'irl',
      title: `${irl.length} révisions de loyer non appliquées`,
      detail: `Date anniversaire dépassée. Les lots F et G sont exclus automatiquement (gel des loyers).`,
      impact: `+${fmtEur(gain * 12)}/an`,
      lotIds: irl.map((l) => l.id),
      mode: 'loyers',
      cta: 'Appliquer les révisions',
    })
  }

  // 5 bis. Régularisation annuelle des charges (lots en copropriété avec provisions)
  const regul = lots.filter((l) => occupied(l) && l.buildingId === 'T')
  if (regul.length) {
    const due = Math.round(regul.reduce((s, l) => s + l.charges * 12 * 0.045, 0))
    alerts.push({
      id: 'regul-T',
      severity: 'important',
      kind: 'regul',
      title: `Régularisation des charges ${CURRENT_YEAR - 1} · ${regul.length} lots`,
      detail: `Résidence Les Tilleuls. Charges réelles du syndic rapprochées des provisions versées : décomptes prêts à envoyer.`,
      impact: `+${fmtEur(due)} à rappeler`,
      lotIds: regul.map((l) => l.id),
      mode: 'loyers',
      cta: 'Générer les décomptes',
    })
  }

  // 6. Retards de paiement
  for (const l of lots.filter((l) => l.payment === 'retard')) {
    alerts.push({
      id: `retard-${l.id}`,
      severity: 'info',
      kind: 'impaye',
      title: `Retard de paiement — ${l.tenant?.name}`,
      detail: `${where(l)}. Le loyer est habituellement réglé à l’heure : relance douce suggérée.`,
      impact: fmtEur(-l.balance),
      lotIds: [l.id],
      mode: 'loyers',
      cta: 'Relancer',
    })
  }

  // 7. Fins de bail / préavis
  for (const l of lots.filter((l) => l.status === 'preavis' || (l.lease && occupied(l) && daysFromToday(l.lease.end) < 90 && !isBanned(l.dpe.letter, CURRENT_YEAR)))) {
    const d = l.noticeEnd ? daysFromToday(l.noticeEnd) : daysFromToday(l.lease!.end)
    alerts.push({
      id: `bail-${l.id}`,
      severity: 'info',
      kind: 'bail',
      title: l.status === 'preavis' ? `Départ de ${l.tenant?.name} dans ${d} jours` : `Fin de bail dans ${d} jours — ${l.tenant?.name}`,
      detail: `${where(l)}. ${l.status === 'preavis' ? 'État des lieux à planifier, relocation à lancer.' : 'Proposer le renouvellement ou préparer la relocation.'}`,
      lotIds: [l.id],
      mode: 'occupation',
      cta: l.status === 'preavis' ? 'Planifier l’EDL' : 'Préparer',
    })
  }

  // 8. Travaux / devis
  for (const l of lots) {
    for (const i of l.interventions) {
      if (i.status === 'devis') {
        alerts.push({
          id: `devis-${l.id}`,
          severity: 'important',
          kind: 'devis',
          title: `Devis ${i.trade.toLowerCase()} en attente depuis ${-daysFromToday(i.date)} jours`,
          detail: `${where(l)} — ${i.title}. Relancer le propriétaire (${l.owner}).`,
          impact: fmtEur(i.cost ?? 0),
          lotIds: [l.id],
          mode: 'travaux',
          cta: 'Relancer le propriétaire',
        })
      } else if (i.status === 'en_cours' && i.trade === 'Plombier') {
        alerts.push({
          id: `travaux-${l.id}`,
          severity: 'info',
          kind: 'travaux',
          title: `${i.company} est sur place`,
          detail: `${where(l)} — ${i.title}. Locataire prévenue par SMS.`,
          lotIds: [l.id],
          mode: 'travaux',
          cta: 'Suivre',
        })
      }
    }
  }

  // 9. Diagnostics échus
  const diag = lots.filter((l) => l.diagExpired)
  if (diag.length) {
    alerts.push({
      id: 'diag',
      severity: 'info',
      kind: 'diag',
      title: `${diag.length} diagnostics électricité/gaz à renouveler`,
      detail: `Obligatoires au prochain bail. Rendez-vous diagnostiqueur proposé.`,
      lotIds: diag.map((l) => l.id),
      mode: 'global',
      cta: 'Commander',
    })
  }

  const order: Record<Severity, number> = { critique: 0, important: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

export interface Kpis {
  lots: number
  occupancy: number
  rentRoll: number
  collected: number
  arrears: number
  bannedNow: number
  bannedSoon: number
  irlGainYear: number
  vacancyLossMonth: number
}

export function computeKpis(lots: Lot[]): Kpis {
  const occ = lots.filter(occupied)
  const rentRoll = lots.reduce((s, l) => s + l.rent + l.charges, 0)
  const expected = occ.reduce((s, l) => s + l.rent + l.charges, 0)
  const arrears = lots.reduce((s, l) => s + Math.max(0, -l.balance), 0)
  return {
    lots: lots.length,
    occupancy: occ.length / lots.length,
    rentRoll,
    collected: expected - arrears,
    arrears,
    bannedNow: lots.filter((l) => isBanned(l.dpe.letter, CURRENT_YEAR)).length,
    bannedSoon: lots.filter((l) => isBanned(l.dpe.letter, 2034)).length,
    irlGainYear: lots.reduce((s, l) => s + irlGain(l), 0) * 12,
    vacancyLossMonth: lots.filter((l) => !occupied(l)).reduce((s, l) => s + l.rent, 0),
  }
}

/** Badge à afficher au-dessus d'un lot en vue globale */
export function lotBadge(l: Lot): { tone: 'red' | 'amber' | 'blue' | 'violet' | 'slate'; text: string } | null {
  if (l.payment === 'impaye') return { tone: 'red', text: 'Impayé' }
  if (occupied(l) && isBanned(l.dpe.letter, CURRENT_YEAR)) return { tone: 'red', text: `DPE ${l.dpe.letter} · non décent` }
  const live = l.interventions.find((i) => i.status === 'en_cours' && i.trade === 'Plombier')
  if (live) return { tone: 'violet', text: 'Fuite · plombier' }
  if (l.status === 'vacant') return { tone: 'slate', text: 'Vacant' }
  if (l.status === 'preavis') return { tone: 'amber', text: 'Préavis' }
  if (l.interventions.some((i) => i.status === 'devis')) return { tone: 'amber', text: 'Devis en attente' }
  return null
}

export { rentFrozen }
