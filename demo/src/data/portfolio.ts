import type { Building, DpeLetter, Intervention, Lease, Lot, PaymentState, Tenant } from './types'
import { addDays, mulberry32 } from '../lib/utils'

// ─────────────────────────────────────────────────────────────
//  Parc fictif : 4 adresses, 38 lots, Lyon 6e
//  Les données sont générées de façon déterministe, avec des
//  « histoires » scénarisées pour la démo (impayé, passoire, fuite…).
// ─────────────────────────────────────────────────────────────

export const BUILDINGS: Building[] = [
  {
    id: 'H',
    name: 'Le Haussmann',
    address: '12 rue Victor-Hugo',
    year: 1892,
    style: 'haussmann',
    position: [-12, -8],
    floors: 5,
    cols: 3,
    lotW: 2.4,
    floorH: 1.25,
    groundH: 1.6,
    depth: 5,
    owner: 'SCI Victor-Hugo',
  },
  {
    id: 'T',
    name: 'Résidence Les Tilleuls',
    address: '4 avenue des Tilleuls',
    year: 2012,
    style: 'modern',
    position: [6.5, -8],
    floors: 4,
    cols: 4,
    lotW: 2.3,
    floorH: 1.2,
    depth: 5.5,
    owner: 'Copropriétaires bailleurs',
  },
  {
    id: 'A',
    name: 'Les Ateliers',
    address: '7 passage des Canuts',
    year: 1954,
    style: 'loft',
    position: [9.5, 7],
    floors: 2,
    cols: 3,
    lotW: 2.8,
    floorH: 1.6,
    depth: 6,
    owner: 'M. et Mme Garnier',
  },
  { id: 'M1', name: 'Maison des Jardins 1', address: '21 rue des Jardins', year: 1932, style: 'house', position: [-15.5, 7.5], floors: 2, cols: 1, lotW: 3.2, floorH: 1.2, depth: 4.6, owner: 'Mme Petit' },
  { id: 'M2', name: 'Maison des Jardins 2', address: '23 rue des Jardins', year: 1930, style: 'house', position: [-11.5, 7.5], floors: 2, cols: 1, lotW: 3.2, floorH: 1.2, depth: 4.6, owner: 'SCI Les Jardins' },
  { id: 'M3', name: 'Maison des Jardins 3', address: '25 rue des Jardins', year: 1938, style: 'house', position: [-7.5, 7.5], floors: 2, cols: 1, lotW: 3.2, floorH: 1.2, depth: 4.6, owner: 'M. Faure' },
]

export const buildingById = Object.fromEntries(BUILDINGS.map((b) => [b.id, b])) as Record<string, Building>

const rnd = mulberry32(20261101)
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
const between = (a: number, b: number) => a + rnd() * (b - a)

const FIRST = ['Camille', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Nathan', 'Manon', 'Louis', 'Emma', 'Théo', 'Sarah', 'Antoine', 'Clara', 'Maxime', 'Jade', 'Thomas', 'Lina', 'Paul', 'Zoé', 'Arthur', 'Alice', 'Yanis', 'Elsa', 'Mehdi', 'Louise', 'Victor', 'Nina', 'Romain', 'Anaïs', 'Karim', 'Margaux', 'Samuel']
const LAST = ['Martin', 'Bernard', 'Dubois', 'Durand', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Garcia', 'Roux', 'Fournier', 'Girard', 'Bonnet', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Blanc', 'Guerin', 'Boyer', 'Chevalier', 'Perrin', 'Morin', 'Mercier', 'Benali', 'Nguyen', 'Lemaire', 'Colin', 'Robin']
const T_OWNERS = ['M. Bernard', 'Mme Lefèvre', 'SCI Les Tilleuls', 'M. et Mme Rousseau', 'Indivision Morel']

const usedNames = new Set<string>()
function personName() {
  let n = ''
  do n = `${pick(FIRST)} ${pick(LAST)}`
  while (usedNames.has(n))
  usedNames.add(n)
  return n
}
const two = () => String(Math.floor(rnd() * 100)).padStart(2, '0')
const phone = () => `0${pick(['6', '7'])} ${two()} ${two()} ${two()} ${two()}`
const email = (name: string) =>
  `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.')}@exemple.fr`

const KWH: Record<DpeLetter, [number, number]> = {
  A: [45, 70], B: [75, 108], C: [115, 178], D: [185, 248], E: [255, 328], F: [335, 418], G: [425, 560],
}

function makeTenant(sinceDays: number, name = personName()): Tenant {
  return {
    name,
    phone: phone(),
    email: email(name),
    since: addDays(-sinceDays),
    guarantor: pick(['Visale', 'GLI Assureur', 'Caution parentale', 'Caution bancaire', 'GLI Assureur']),
  }
}

function makeLease(sinceDays: number, furnished: boolean, revised: boolean): Lease {
  const term = furnished ? 365 : 3 * 365
  // reconduction tacite : fin = prochaine échéance
  let end = -sinceDays + term
  while (end < 0) end += term
  // date anniversaire de révision : la plus récente passée, ou la prochaine si < 1 an
  let rev = -sinceDays + 365
  while (rev + 365 < 0) rev += 365
  if (rev > 0 && sinceDays < 365) rev = -sinceDays + 365
  return {
    type: furnished ? 'Bail meublé 1 an' : 'Bail nu 3 ans',
    start: addDays(-sinceDays),
    end: addDays(end),
    revisionDate: addDays(rev),
    revised,
    deposit: 0,
  }
}

interface Spec {
  id: string
  buildingId: string
  floor: number
  col: number
  spanFloors?: number
  spanCols?: number
  typology: Lot['typology']
  surface: number
  dpe: DpeLetter
  owner?: string
  rentRate: number
  charges: number
  furnished?: boolean
  /** Surcharges scénarisées */
  story?: Partial<Lot> & { tenantName?: string; sinceDays?: number; revised?: boolean }
}

function build(spec: Spec): Lot {
  const b = buildingById[spec.buildingId]
  const story = spec.story ?? {}
  const sinceDays = story.sinceDays ?? Math.floor(between(70, 1500))
  const rent = Math.round((spec.surface * spec.rentRate) / 5) * 5
  const status = story.status ?? 'loue'
  const occupied = status === 'loue' || status === 'preavis'
  const revised = story.revised ?? rnd() > 0.28
  const lease = occupied ? makeLease(sinceDays, !!spec.furnished, revised) : undefined
  if (lease) lease.deposit = spec.furnished ? rent * 2 : rent
  if (lease && spec.typology === 'Commerce') lease.type = 'Bail commercial 3-6-9'

  const history: PaymentState[] = Array.from({ length: 6 }, () => (rnd() > 0.93 ? 'retard' : 'ok'))
  const [kmin, kmax] = KWH[spec.dpe]

  return {
    id: spec.id,
    buildingId: spec.buildingId,
    floor: spec.floor,
    col: spec.col,
    spanFloors: spec.spanFloors ?? 1,
    spanCols: spec.spanCols ?? 1,
    label: spec.typology === 'Commerce' ? 'Local commercial' : `Lot ${spec.id}`,
    typology: spec.typology,
    surface: spec.surface,
    status,
    owner: spec.owner ?? b.owner,
    tenant: occupied ? makeTenant(sinceDays, story.tenantName) : undefined,
    lease,
    rent,
    charges: spec.charges,
    payment: occupied ? 'ok' : 'ok',
    balance: 0,
    history: occupied ? history : (Array(6).fill('ok') as PaymentState[]),
    dpe: { letter: spec.dpe, kwh: Math.round(between(kmin, kmax)), date: addDays(-Math.floor(between(200, 2400))) },
    interventions: [],
    ...stripStory(story),
  }
}

function stripStory(story: NonNullable<Spec['story']>): Partial<Lot> {
  const { tenantName: _t, sinceDays: _s, revised: _r, ...rest } = story
  return rest
}

const iv = (i: Omit<Intervention, 'id'>): Intervention => ({ id: `${i.trade}-${i.title}`.replace(/\s/g, '-'), ...i })

// ── Le Haussmann : RDC commerce + 4 étages × 3 lots ─────────────
const H_DPE: DpeLetter[] = ['F', 'E', 'D', 'E', 'D', 'F', 'D', 'E', 'E', 'F', 'E', 'G']
const H_SURF = [62, 48, 66, 64, 46, 68, 60, 45, 63, 34, 28, 22]
const H_TYPO: Lot['typology'][] = ['T3', 'T2', 'T3', 'T3', 'T2', 'T3', 'T3', 'T2', 'T3', 'T2', 'T1', 'Studio']

const specs: Spec[] = [
  {
    id: 'H-0', buildingId: 'H', floor: 0, col: 0, spanCols: 3, typology: 'Commerce', surface: 110, dpe: 'D', rentRate: 19, charges: 180,
    story: { tenantName: 'Boulangerie Martin', sinceDays: 2100, revised: true },
  },
]
for (let f = 1; f <= 4; f++) {
  for (let c = 0; c < 3; c++) {
    const i = (f - 1) * 3 + c
    specs.push({
      id: `H-${f}${'ABC'[c]}`, buildingId: 'H', floor: f, col: c, typology: H_TYPO[i], surface: H_SURF[i], dpe: H_DPE[i],
      rentRate: H_SURF[i] < 30 ? 21 : 15.5, charges: H_SURF[i] < 30 ? 45 : 80, furnished: H_SURF[i] < 30,
    })
  }
}

// ── Résidence Les Tilleuls : 4 niveaux × 4 lots ────────────────
const T_DPE: DpeLetter[] = ['C', 'B', 'C', 'C', 'B', 'C', 'B', 'C', 'C', 'B', 'B', 'D', 'B', 'C', 'B', 'C']
const T_SURF = [42, 58, 71, 44, 43, 60, 72, 45, 44, 61, 70, 46, 45, 62, 74, 52]
const T_TYPO: Lot['typology'][] = ['T2', 'T3', 'T4', 'T2', 'T2', 'T3', 'T4', 'T2', 'T2', 'T3', 'T4', 'T2', 'T2', 'T3', 'T4', 'T3']
for (let f = 0; f < 4; f++) {
  for (let c = 0; c < 4; c++) {
    const i = f * 4 + c
    specs.push({
      id: `T-${f}${'ABCD'[c]}`, buildingId: 'T', floor: f, col: c, typology: T_TYPO[i], surface: T_SURF[i], dpe: T_DPE[i],
      owner: T_OWNERS[i % T_OWNERS.length], rentRate: 15, charges: 95,
    })
  }
}

// ── Les Ateliers : 2 niveaux × 3 lofts ─────────────────────────
const A_DPE: DpeLetter[] = ['D', 'C', 'D', 'E', 'D', 'E']
const A_SURF = [78, 85, 74, 80, 88, 76]
for (let f = 0; f < 2; f++) {
  for (let c = 0; c < 3; c++) {
    const i = f * 3 + c
    specs.push({
      id: `A-${f}${'ABC'[c]}`, buildingId: 'A', floor: f, col: c, typology: A_SURF[i] > 82 ? 'T4' : 'T3', surface: A_SURF[i], dpe: A_DPE[i],
      rentRate: 14.5, charges: 70,
    })
  }
}

// ── Maisons de ville ───────────────────────────────────────────
specs.push(
  { id: 'M1', buildingId: 'M1', floor: 0, col: 0, spanFloors: 2, typology: 'Maison T4', surface: 92, dpe: 'F', rentRate: 13, charges: 0 },
  { id: 'M2', buildingId: 'M2', floor: 0, col: 0, spanFloors: 2, typology: 'Maison T5', surface: 104, dpe: 'G', rentRate: 12.5, charges: 0 },
  { id: 'M3', buildingId: 'M3', floor: 0, col: 0, spanFloors: 2, typology: 'Maison T4', surface: 88, dpe: 'E', rentRate: 13, charges: 0 },
)

// ── Histoires scénarisées ─────────────────────────────────────
const STORIES: Record<string, NonNullable<Spec['story']>> = {
  // Impayé de 2 mois
  'H-3B': {
    tenantName: 'Julien Leroy', sinceDays: 820, payment: 'impaye', balance: -1720,
    history: ['ok', 'ok', 'ok', 'retard', 'impaye', 'impaye'],
  },
  // Studio sous les toits classé G : non décent depuis 2025
  'H-4C': { tenantName: 'Inès Haddad', sinceDays: 1000, revised: false, diagExpired: true },
  // Fuite en cours → plombier sur place
  'H-2C': {
    tenantName: 'Claire Dumont',
    interventions: [
      iv({ title: 'Fuite sous l’évier de la cuisine', trade: 'Plombier', company: 'Dupont Plomberie', status: 'en_cours', date: addDays(0), cost: 240, note: 'Signalée par la locataire via le portail à 8 h 12' }),
    ],
  },
  'H-1A': { revised: false },
  // Résidence Les Tilleuls
  'T-2C': {
    tenantName: 'Mathis Garnier', payment: 'retard', balance: -660,
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'retard'],
  },
  'T-1A': { status: 'vacant', vacantSince: addDays(-47) },
  'T-3D': { tenantName: 'Laura Vidal', status: 'preavis', noticeEnd: addDays(38) },
  'T-0B': {
    status: 'travaux',
    interventions: [
      iv({ title: 'Rafraîchissement peintures avant relocation', trade: 'Peintre', company: 'Atelier Couleurs', status: 'en_cours', date: addDays(-3), cost: 2650 }),
    ],
  },
  'T-2A': { tenantName: 'Yanis Benali', sinceDays: 305, revised: true },
  'T-0A': { revised: false, sinceDays: 700 },
  'T-1C': { revised: false, sinceDays: 1130 },
  'T-3B': { revised: false, sinceDays: 400 },
  'T-0D': { revised: false, sinceDays: 1500 },
  // Les Ateliers
  'A-1B': {
    tenantName: 'Romain Chevalier', payment: 'impaye', balance: -1310,
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'impaye'],
  },
  'A-0A': {
    revised: false,
    interventions: [
      iv({ title: 'Entretien annuel de la chaudière', trade: 'Chauffagiste', company: 'Thermi’Rhône', status: 'planifiee', date: addDays(4), cost: 145 }),
    ],
  },
  'A-0C': { revised: false, sinceDays: 900 },
  // Maisons
  'M2': { tenantName: 'Famille Lambert', sinceDays: 1500, diagExpired: true },
  'M3': {
    interventions: [
      iv({ title: 'Reprise de la toiture (tuiles déplacées)', trade: 'Couvreur', company: 'Toitures du Lyonnais', status: 'devis', date: addDays(-12), cost: 3480, note: 'Devis en attente de validation du propriétaire depuis 12 jours' }),
    ],
  },
}

for (const s of specs) if (STORIES[s.id]) s.story = STORIES[s.id]

// Les lots non scénarisés sont tous révisés, pour garder des chiffres lisibles
for (const s of specs) if (!s.story) s.story = { revised: true }

export const INITIAL_LOTS: Lot[] = specs.map(build)

// Le studio G doit arriver à échéance de bail dans ~4 mois (reconduction impossible)
const studio = INITIAL_LOTS.find((l) => l.id === 'H-4C')!
studio.lease!.end = addDays(128)
// La maison G : échéance dans ~7 mois
const m2 = INITIAL_LOTS.find((l) => l.id === 'M2')!
m2.lease!.end = addDays(212)
// Fin de bail meublé proche
const t2a = INITIAL_LOTS.find((l) => l.id === 'T-2A')!
t2a.lease!.end = addDays(60)
