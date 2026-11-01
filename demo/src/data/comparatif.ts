// Comparatif de la fiche A4 (verso). Chaque affirmation sur le concurrent
// est vérifiable : voir docs/audit/03-concurrent-verifie.md (sources consultées le 01/11/2026).
// Règle : « non mentionné » ≠ « ne fait pas ». Ne jamais écrire « Crypto ne fait pas X ».

export type Mark = 'oui' | 'partiel' | 'non' | 'nc'

export interface Row {
  label: string
  atlas: Mark
  rival: Mark
  note?: string
  src?: number[]
}

export interface Group {
  title: string
  rows: Row[]
}

export const RIVAL = {
  name: 'Crypto',
  editor: 'Orisha Real Estate',
  checkedOn: '01/11/2026',
}

export const GROUPS: Group[] = [
  {
    title: 'Le socle de la gérance',
    rows: [
      { label: 'Comptabilité mandant, règlements propriétaires, CRG', atlas: 'non', rival: 'oui', note: 'reste dans votre logiciel', src: [1] },
      { label: 'Appels de loyers et quittances', atlas: 'oui', rival: 'oui', src: [1] },
      { label: 'Relances des impayés', atlas: 'oui', rival: 'oui', src: [1] },
      { label: 'Régularisation des charges', atlas: 'partiel', rival: 'oui', note: 'décomptes simplifiés', src: [1] },
      { label: 'Ordres de service et suivi des artisans', atlas: 'oui', rival: 'oui', src: [3, 5] },
      { label: 'Extranets propriétaire et locataire', atlas: 'partiel', rival: 'oui', note: 'portail de signalement', src: [3] },
      { label: 'Signature et recommandé électroniques', atlas: 'partiel', rival: 'oui', note: 'via partenaires', src: [2, 3] },
      { label: 'Hiérarchisation des tâches du jour', atlas: 'oui', rival: 'oui', note: 'Organiseur chez Crypto', src: [2] },
    ],
  },
  {
    title: 'Ce qu’Atlas ajoute',
    rows: [
      { label: 'Échéances DPE 2025 / 2028 / 2034, lot par lot, avec budget', atlas: 'oui', rival: 'nc', src: [1, 2, 3] },
      { label: 'Gel des loyers F/G appliqué aux révisions IRL', atlas: 'oui', rival: 'nc', src: [1, 2, 3] },
      { label: 'Plan 3D du parc, coloré par statut', atlas: 'oui', rival: 'nc', src: [1, 2, 3] },
      { label: 'Données publiques en direct : ADEME, INSEE, IGN, Géorisques', atlas: 'oui', rival: 'nc', src: [1, 2, 3] },
      { label: 'Chaque alerte chiffrée en euros', atlas: 'oui', rival: 'nc', src: [1, 2] },
      { label: 'Questions en français, sources citées', atlas: 'partiel', rival: 'nc', note: 'démo hors ligne', src: [1, 2, 3] },
      { label: 'Développé selon vos process', atlas: 'oui', rival: 'partiel', note: '« développement spécifique » chez Crypto', src: [2] },
      { label: 'Prix affiché', atlas: 'oui', rival: 'non', note: 'Crypto : sur proposition commerciale', src: [4] },
    ],
  },
  {
    title: 'Maturité',
    rows: [{ label: 'Éditeur établi : plus de 30 ans, plus de 1 350 clients', atlas: 'non', rival: 'oui', note: 'Atlas : nouvelle solution', src: [1, 2] }],
  },
]

export const RIVAL_STRENGTHS: { text: string; src: number[] }[] = [
  { text: 'Comptabilité de gérance complète : appels, règlements propriétaires, CRG, rapprochements, régularisations', src: [1] },
  { text: 'Plus de 30 ans d’existence, plus de 1 350 clients revendiqués', src: [1, 2] },
  { text: 'Une base unique pour la gérance, le syndic et la location saisonnière', src: [1] },
  { text: 'Écosystème intégré : extranets, tickets, signature, recommandé électronique', src: [2, 3] },
]

export const SOURCES: { n: number; label: string; url: string }[] = [
  { n: 1, label: 'Orisha Real Estate, « La Solution Crypto » (màj 18/07/2025)', url: 'realestate.orisha.com/nos-solutions/crypto' },
  { n: 2, label: '« La Solution Crypto, catalogue produits » (PDF, déc. 2019)', url: 'realestate.orisha.com/app/uploads/2023/12/Plaquette-Crypto.pdf' },
  { n: 3, label: 'Store Crypto : extranet, tickets, AR24, signature (pages non datées)', url: 'store.crypto.fr' },
  { n: 4, label: 'CGV Crypto, màj du 01/10/2023, art. 12.1', url: 'realestate.orisha.com/app/uploads/2024/06/CGV-Crypto-2024.pdf' },
  { n: 5, label: 'Orisha, « Kolimmo » (màj 25/05/2026)', url: 'realestate.orisha.com/nos-solutions/kolimmo' },
]
