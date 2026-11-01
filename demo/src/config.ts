// ─────────────────────────────────────────────────────────────
//  Personnalisation de la démo (à adapter au prospect en 2 min)
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  /** Nom du client fictif affiché dans l'app */
  agency: 'Horizon Gestion',
  /** Nom du produit */
  product: 'Atlas',
  tagline: 'Jumeau numérique du parc locatif',
  /** Prénom de l'utilisateur connecté (gestionnaire) */
  user: 'Sophie',
  city: 'Lyon 6e',
}

/**
 * Calendrier d'interdiction de location des « passoires énergétiques »
 * (loi Climat et Résilience du 22 août 2021, art. 160).
 * Un logement classé X devient non décent au 1er janvier de l'année indiquée.
 */
export const DPE_BANS: { letter: 'G' | 'F' | 'E'; year: number }[] = [
  { letter: 'G', year: 2025 },
  { letter: 'F', year: 2028 },
  { letter: 'E', year: 2034 },
]

/** Variation annuelle de l'IRL utilisée pour estimer les révisions de loyer. */
export const IRL = {
  label: 'IRL T3 2026',
  value: 148.06,
  variation: 0.0157,
  published: '15/10/2026',
}

/** Délai d'inactivité avant le lancement automatique du mode salon (ms). */
export const KIOSK_IDLE_MS = 45_000
