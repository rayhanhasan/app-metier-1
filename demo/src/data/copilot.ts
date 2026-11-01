import type { Lot, ViewMode } from './types'
import { buildingById } from './portfolio'
import { computeKpis } from './insights'
import { IRL } from '../config'
import { CURRENT_YEAR, daysFromToday, fmtEur, fmtPct, irlGain, isBanned, normalize } from '../lib/utils'

// ─────────────────────────────────────────────────────────────
//  « Demandez à votre parc » — moteur d'intentions hors ligne.
//  En production : brancher un LLM (ex. API Claude) avec les
//  données du parc en contexte. Ici, la démo doit tourner sans
//  réseau sur le stand, donc on reconnaît des intentions clés.
// ─────────────────────────────────────────────────────────────

export interface CopilotResult {
  text: string
  ids: string[]
  mode: ViewMode
  year?: number
  label: string
  sources: string[]
}

export const SUGGESTIONS = [
  'Qui n’a pas payé ce mois-ci ?',
  'Quels logements seront interdits en 2028 ?',
  'Combien me coûte la vacance ?',
  'Quels baux se terminent bientôt ?',
  'Où en sont les travaux ?',
  'Quels loyers puis-je réviser ?',
]

const occupied = (l: Lot) => l.status === 'loue' || l.status === 'preavis'
const names = (ls: Lot[]) => ls.map((l) => `${l.tenant?.name ?? l.label} (${l.id})`).join(', ')

const INTENTS: { keys: string[]; run: (lots: Lot[]) => CopilotResult }[] = [
  {
    keys: ['impay', 'pas paye', 'paye pas', 'retard', 'doit', 'dette', 'relance', 'encaiss'],
    run: (lots) => {
      const ls = lots.filter((l) => l.payment !== 'ok')
      const total = ls.reduce((s, l) => s + Math.max(0, -l.balance), 0)
      return {
        text: `${ls.length} locataires ne sont pas à jour, pour ${fmtEur(total)} au total : ${names(ls)}. J’ai préparé les relances (SMS + e-mail) et la mise en demeure pour l’impayé de 2 mois. Un clic pour les envoyer.`,
        ids: ls.map((l) => l.id),
        mode: 'loyers',
        label: 'Locataires en retard ou en impayé',
        sources: ['Relevés bancaires (open banking)', 'Échéancier des baux'],
      }
    },
  },
  {
    keys: ['passoire', 'dpe', 'energ', 'thermique', 'climat', 'interdit', 'renov', 'isol', 'decen'],
    run: (lots) => {
      const now = lots.filter((l) => isBanned(l.dpe.letter, CURRENT_YEAR))
      const f = lots.filter((l) => l.dpe.letter === 'F')
      const e = lots.filter((l) => l.dpe.letter === 'E')
      const rent = (ls: Lot[]) => fmtEur(ls.reduce((s, l) => s + l.rent * 12, 0))
      return {
        text: `${now.length} logements sont déjà interdits à la location (classe G) : ${rent(now)} de loyers par an en jeu. ${f.length} logements F le seront au 1er janvier 2028 (${rent(f)}/an), puis ${e.length} logements E en 2034. Faites glisser la frise pour voir l’évolution.`,
        ids: [...now, ...f].map((l) => l.id),
        mode: 'dpe',
        year: 2028,
        label: 'Passoires thermiques (G et F)',
        sources: ['DPE · Observatoire ADEME', 'Loi Climat et Résilience, art. 160 (Légifrance)'],
      }
    },
  },
  {
    keys: ['vacan', 'vide', 'libre', 'disponible', 'perte', 'manque', 'louer'],
    run: (lots) => {
      const ls = lots.filter((l) => !occupied(l))
      const loss = ls.reduce((s, l) => s + l.rent, 0)
      const k = computeKpis(lots)
      return {
        text: `${ls.length} lots ne produisent pas de loyer en ce moment, soit ${fmtEur(loss)} de manque à gagner par mois (taux d’occupation : ${fmtPct(k.occupancy)}). Le ${ls[0]?.id} est vacant depuis ${ls[0]?.vacantSince ? -daysFromToday(ls[0].vacantSince) : '—'} jours : l’annonce est prête à être diffusée.`,
        ids: ls.map((l) => l.id),
        mode: 'occupation',
        label: 'Lots sans loyer',
        sources: ['État locatif', 'Loyers de marché (annonces)'],
      }
    },
  },
  {
    keys: ['bail', 'baux', 'fin', 'expire', 'preavis', 'depart', 'renouvel', 'echeance'],
    run: (lots) => {
      const ls = lots.filter((l) => l.status === 'preavis' || (l.lease && occupied(l) && daysFromToday(l.lease.end) < 240))
      const lines = ls
        .sort((a, b) => daysFromToday(a.noticeEnd ?? a.lease!.end) - daysFromToday(b.noticeEnd ?? b.lease!.end))
        .map((l) => `${l.id} dans ${daysFromToday(l.noticeEnd ?? l.lease!.end)} j`)
      return {
        text: `${ls.length} échéances dans les 8 prochains mois : ${lines.join(', ')}. Attention : les lots classés G ne pourront pas être renouvelés en l’état.`,
        ids: ls.map((l) => l.id),
        mode: 'occupation',
        label: 'Baux qui arrivent à échéance',
        sources: ['Baux signés (GED)', 'DPE · Observatoire ADEME'],
      }
    },
  },
  {
    keys: ['travaux', 'artisan', 'intervention', 'plomb', 'fuite', 'devis', 'chantier', 'chaudiere', 'toit'],
    run: (lots) => {
      const ls = lots.filter((l) => l.interventions.length)
      const lines = ls.map((l) => `${l.interventions[0].trade.toLowerCase()} au ${l.id} (${l.interventions[0].status === 'en_cours' ? 'en cours' : l.interventions[0].status === 'devis' ? 'devis à valider' : 'planifié'})`)
      return {
        text: `${ls.length} interventions suivies : ${lines.join(', ')}. Le devis toiture attend la validation du propriétaire depuis 12 jours : je peux le relancer.`,
        ids: ls.map((l) => l.id),
        mode: 'travaux',
        label: 'Interventions en cours',
        sources: ['Tickets locataires', 'Devis et factures artisans'],
      }
    },
  },
  {
    keys: ['irl', 'revis', 'augment', 'index', 'hausse'],
    run: (lots) => {
      const ls = lots.filter((l) => irlGain(l) > 0)
      const gain = ls.reduce((s, l) => s + irlGain(l), 0)
      return {
        text: `${ls.length} loyers peuvent être révisés (date anniversaire dépassée) : +${fmtEur(gain)} par mois, soit +${fmtEur(gain * 12)} par an. Les logements F et G sont exclus automatiquement, leur loyer étant gelé.`,
        ids: ls.map((l) => l.id),
        mode: 'loyers',
        label: 'Révisions de loyer possibles',
        sources: [`INSEE · ${IRL.label} = ${IRL.value}`, 'Dates anniversaires des baux', 'Gel des loyers F/G (loi Climat)'],
      }
    },
  },
  {
    keys: ['rentab', 'rendement', 'revenu', 'chiffre', 'combien', 'gagne', 'resume', 'bilan', 'situation', 'ca '],
    run: (lots) => {
      const k = computeKpis(lots)
      return {
        text: `Votre parc : ${k.lots} lots sur 4 adresses, ${fmtPct(k.occupancy)} d’occupation, ${fmtEur(k.rentRoll)} de quittancement mensuel potentiel. Encaissé ce mois-ci : ${fmtEur(k.collected)}. Impayés : ${fmtEur(k.arrears)}. Potentiel non exploité : +${fmtEur(k.irlGainYear)}/an de révisions.`,
        ids: [],
        mode: 'global',
        label: 'Synthèse du parc',
        sources: ['État locatif', 'Relevés bancaires'],
      }
    },
  },
]

export function askCopilot(question: string, lots: Lot[]): CopilotResult {
  const q = normalize(question)
  // recherche directe d'un lot ou d'un locataire
  const byId = lots.find((l) => q.includes(normalize(l.id)) || (l.tenant && q.includes(normalize(l.tenant.name.split(' ').slice(-1)[0]))))
  if (byId && !INTENTS.some((i) => i.keys.some((k) => q.includes(k)))) {
    const b = buildingById[byId.buildingId]
    return {
      text: `${byId.label} (${b.name}) : ${byId.typology} de ${byId.surface} m², ${byId.tenant ? `loué à ${byId.tenant.name}` : 'non loué'}, ${fmtEur(byId.rent)} HC/mois, DPE ${byId.dpe.letter}.`,
      ids: [byId.id],
      mode: 'global',
      label: byId.label,
      sources: ['Fiche du lot'],
    }
  }
  const intent = INTENTS.find((i) => i.keys.some((k) => q.includes(k)))
  if (intent) return intent.run(lots)
  return {
    text: 'Je peux vous répondre sur les impayés, les passoires thermiques (DPE), la vacance, les fins de bail, les travaux et les révisions de loyer. Essayez par exemple « Qui n’a pas payé ce mois-ci ? »',
    ids: [],
    mode: 'global',
    label: '',
    sources: [],
  }
}
