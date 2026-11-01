export type DpeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type LotStatus = 'loue' | 'vacant' | 'preavis' | 'travaux'
export type PaymentState = 'ok' | 'retard' | 'impaye'
export type ViewMode = 'global' | 'occupation' | 'loyers' | 'dpe' | 'travaux'
export type BuildingStyle = 'haussmann' | 'modern' | 'loft' | 'house'

export interface Building {
  id: string
  name: string
  address: string
  year: number
  style: BuildingStyle
  /** Centre du bâtiment au sol (x, z) */
  position: [number, number]
  floors: number
  cols: number
  lotW: number
  floorH: number
  depth: number
  /** Hauteur du rez-de-chaussée si différente */
  groundH?: number
  owner: string
}

export interface Tenant {
  name: string
  phone: string
  email: string
  since: string // ISO
  guarantor: string
}

export interface Lease {
  type: 'Bail nu 3 ans' | 'Bail meublé 1 an' | 'Bail mobilité' | 'Bail commercial 3-6-9'
  start: string
  end: string
  /** Date anniversaire de révision */
  revisionDate: string
  /** La révision de l'année a-t-elle été appliquée ? */
  revised: boolean
  deposit: number
}

export interface Intervention {
  id: string
  title: string
  trade: 'Plombier' | 'Électricien' | 'Chauffagiste' | 'Serrurier' | 'Couvreur' | 'Peintre'
  company: string
  status: 'en_cours' | 'planifiee' | 'devis'
  date: string
  cost?: number
  note?: string
}

export interface Lot {
  id: string
  buildingId: string
  floor: number
  col: number
  spanFloors: number
  spanCols: number
  label: string
  typology: 'Studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'Commerce' | 'Maison T4' | 'Maison T5'
  surface: number
  status: LotStatus
  owner: string
  tenant?: Tenant
  lease?: Lease
  rent: number
  charges: number
  payment: PaymentState
  /** Solde locataire (négatif = dette) */
  balance: number
  /** 6 derniers mois, du plus ancien au plus récent */
  history: PaymentState[]
  dpe: { letter: DpeLetter; kwh: number; date: string }
  interventions: Intervention[]
  vacantSince?: string
  noticeEnd?: string
  /** Diagnostic électricité / gaz arrivé à échéance */
  diagExpired?: boolean
}
