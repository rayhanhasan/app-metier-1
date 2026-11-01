import { DPE_BANS, IRL } from '../config'
import type { DpeLetter, Lot } from '../data/types'

// ── Aléatoire déterministe ─────────────────────────────────────
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Dates (relatives à aujourd'hui pour que la démo ne vieillisse pas) ──
export const TODAY = new Date()
TODAY.setHours(10, 0, 0, 0)
export const CURRENT_YEAR = TODAY.getFullYear()

export function addDays(days: number, from: Date = TODAY): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function daysFromToday(iso: string): number {
  return Math.round((new Date(iso).getTime() - TODAY.getTime()) / 86_400_000)
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso))
export const fmtMonth = (offset: number) => {
  const d = new Date(TODAY)
  d.setMonth(d.getMonth() + offset)
  return monthFmt.format(d).replace('.', '')
}

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export const fmtEur = (n: number) => eur.format(Math.round(n))
export const fmtPct = (n: number, digits = 0) => `${(n * 100).toFixed(digits).replace('.', ',')} %`

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// ── Réglementation DPE ─────────────────────────────────────────
export function banYear(letter: DpeLetter): number | null {
  return DPE_BANS.find((b) => b.letter === letter)?.year ?? null
}

/** Le logement est-il non décent (interdit à la location) l'année donnée ? */
export function isBanned(letter: DpeLetter, year: number) {
  const y = banYear(letter)
  return y !== null && year >= y
}

/** Gel des loyers des logements F et G (loi Climat, depuis le 24/08/2022) */
export const rentFrozen = (letter: DpeLetter) => letter === 'F' || letter === 'G'

export const DPE_COLORS: Record<DpeLetter, string> = {
  A: '#009c6d',
  B: '#52b153',
  C: '#a3cc4a',
  D: '#f4e70f',
  E: '#f0b50f',
  F: '#eb8235',
  G: '#d7221f',
}

export const DPE_RANGES: Record<DpeLetter, string> = {
  A: '≤ 70',
  B: '71 à 110',
  C: '111 à 180',
  D: '181 à 250',
  E: '251 à 330',
  F: '331 à 420',
  G: '> 420',
}

/** Gain mensuel d'une révision IRL non appliquée (0 si gel F/G ou déjà faite). */
export function irlGain(lot: Lot): number {
  if (!lot.lease || lot.lease.revised || lot.typology === 'Commerce') return 0
  if (rentFrozen(lot.dpe.letter)) return 0
  if (daysFromToday(lot.lease.revisionDate) > 0) return 0
  return Math.round(lot.rent * IRL.variation)
}

/** Estimation grossière d'un plan de rénovation pour atteindre la classe C/D. */
export function renovationPlan(lot: Lot) {
  const l = lot.dpe.letter
  if (!['E', 'F', 'G'].includes(l)) return null
  const rate = l === 'G' ? 520 : l === 'F' ? 380 : 260
  const target: DpeLetter = l === 'G' ? 'D' : 'C'
  const works =
    l === 'G'
      ? ['Isolation des murs par l’intérieur', 'Pompe à chaleur air/air', 'VMC hygroréglable', 'Double vitrage']
      : l === 'F'
        ? ['Isolation des combles / plancher haut', 'Remplacement des convecteurs', 'VMC hygroréglable']
        : ['Isolation des combles', 'Programmation du chauffage']
  const cost = Math.round((lot.surface * rate) / 100) * 100
  const annualRent = lot.rent * 12
  return { target, works, cost, annualRent, payback: cost / Math.max(annualRent, 1) }
}
