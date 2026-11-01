import type { Lot, ViewMode } from '../data/types'
import { DPE_COLORS, isBanned } from './utils'

export const ACCENT = '#1d4ed8'
export const ACCENT_LIGHT = '#3b82f6'

export const PALETTE = {
  base: '#f8fafc',
  hover: '#dbeafe',
  selected: '#2563eb',
  occupied: '#3b82f6',
  vacant: '#cbd5e1',
  notice: '#f59e0b',
  works: '#8b5cf6',
  ok: '#22c55e',
  late: '#f59e0b',
  unpaid: '#ef4444',
  idle: '#e2e8f0',
  planned: '#c4b5fd',
  quote: '#fbbf24',
}

export interface LegendItem {
  color: string
  label: string
}

export function lotColor(lot: Lot, mode: ViewMode): string {
  switch (mode) {
    case 'global':
      return PALETTE.base
    case 'occupation':
      return lot.status === 'loue'
        ? PALETTE.occupied
        : lot.status === 'vacant'
          ? PALETTE.vacant
          : lot.status === 'preavis'
            ? PALETTE.notice
            : PALETTE.works
    case 'loyers':
      if (lot.status === 'vacant' || lot.status === 'travaux') return PALETTE.idle
      return lot.payment === 'ok' ? PALETTE.ok : lot.payment === 'retard' ? PALETTE.late : PALETTE.unpaid
    case 'dpe':
      return DPE_COLORS[lot.dpe.letter]
    case 'travaux': {
      if (lot.interventions.some((i) => i.status === 'en_cours')) return PALETTE.works
      if (lot.interventions.some((i) => i.status === 'devis')) return PALETTE.quote
      if (lot.interventions.some((i) => i.status === 'planifiee')) return PALETTE.planned
      return PALETTE.idle
    }
  }
}

/** Le lot doit-il « pulser » (alerte visuelle) ? */
export function lotPulse(lot: Lot, mode: ViewMode, year: number): boolean {
  if (mode === 'dpe') return lot.status !== 'vacant' && isBanned(lot.dpe.letter, year)
  if (mode === 'loyers') return lot.payment === 'impaye'
  if (mode === 'travaux') return lot.interventions.some((i) => i.status === 'en_cours')
  return false
}

export const LEGENDS: Record<ViewMode, LegendItem[]> = {
  global: [],
  occupation: [
    { color: PALETTE.occupied, label: 'Loué' },
    { color: PALETTE.notice, label: 'Préavis' },
    { color: PALETTE.works, label: 'En travaux' },
    { color: PALETTE.vacant, label: 'Vacant' },
  ],
  loyers: [
    { color: PALETTE.ok, label: 'À jour' },
    { color: PALETTE.late, label: 'Retard' },
    { color: PALETTE.unpaid, label: 'Impayé' },
    { color: PALETTE.idle, label: 'Non loué' },
  ],
  dpe: (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const).map((l) => ({ color: DPE_COLORS[l], label: l })),
  travaux: [
    { color: PALETTE.works, label: 'En cours' },
    { color: PALETTE.quote, label: 'Devis à valider' },
    { color: PALETTE.planned, label: 'Planifié' },
    { color: PALETTE.idle, label: 'RAS' },
  ],
}
