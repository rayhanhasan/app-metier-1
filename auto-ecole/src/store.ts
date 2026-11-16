import { create } from 'zustand'
import { Sim, type SchoolState } from './sim/sim'
import { MODELS } from './assets'

export type TimeOfDay = 'day' | 'golden' | 'night'
export type Shot = 'free' | 'hero' | 'front' | 'lot' | 'cafe' | 'roundabout' | 'top' | 'chase'

/** Une ligne du suivi des moniteurs : en voiture, en pause, en salle de code… */
export interface StaffRow {
  id: string
  name: string
  where: 'voiture' | 'café' | 'salle de code' | 'accueil'
  status: string
  dot: string
  /** renseignés pour un moniteur en voiture */
  n?: number
  plate?: string
  student?: string
  hour?: number
  skill?: string
  state?: SchoolState
}

/** Moniteurs qui ne sont pas en voiture en ce moment (présents dans la scène) */
const STATIC_STAFF: (StaffRow & { shot: Shot })[] = [
  { id: 'st-code', name: 'Amélie P.', where: 'salle de code', status: 'Anime la séance de code · 9 élèves', dot: '#a78bfa', shot: 'front' },
  { id: 'st-front', name: 'Thomas G.', where: 'accueil', status: 'Devant l’auto-école · attend son élève', dot: '#38bdf8', shot: 'front' },
  { id: 'st-cafe-1', name: 'Marc T.', where: 'café', status: 'En pause au café · reprend à 14 h 30', dot: '#f59e0b', shot: 'cafe' },
  { id: 'st-cafe-2', name: 'Claire V.', where: 'café', status: 'En pause au café · reprend à 14 h 45', dot: '#f59e0b', shot: 'cafe' },
]

interface UiState {
  tod: TimeOfDay
  shot: Shot
  cinema: boolean
  selected: string | null
  staff: StaffRow[]
  events: { t: number; text: string }[]
  clock: string
  light: 'green' | 'orange' | 'red'
  labels: boolean
  setTod: (t: TimeOfDay) => void
  setShot: (s: Shot) => void
  setCinema: (c: boolean) => void
  select: (id: string | null) => void
  toggleLabels: () => void
}

const q = new URLSearchParams(location.search)

export const useUi = create<UiState>((set) => ({
  tod: (q.get('tod') as TimeOfDay) ?? 'day',
  shot: (q.get('shot') as Shot) ?? 'hero',
  cinema: q.has('cinema'),
  selected: q.get('car'),
  staff: [],
  events: [],
  clock: '14:12',
  light: 'green',
  labels: !q.has('nolabels'),
  setTod: (tod) => set({ tod }),
  setShot: (shot) => set({ shot, cinema: false }),
  setCinema: (cinema) => set({ cinema }),
  select: (selected) => {
    if (!selected) return set({ selected: null, shot: 'hero' })
    const fixed = STATIC_STAFF.find((x) => x.id === selected)
    set({ selected, shot: fixed ? fixed.shot : 'chase', cinema: false })
  },
  toggleLabels: () => set((s) => ({ labels: !s.labels })),
}))

// La simulation est créée après le chargement de l'index des modèles (voir main.tsx)
export let sim: Sim
export function createSim() {
  const traffic = MODELS.cars.filter((c) => !c.file.endsWith('peugeot-208')).length
  sim = new Sim(traffic, MODELS.people.length)
  const warm = Number(q.get('t') ?? 0)
  for (let i = 0; i < warm * 30; i++) sim.step(1 / 30)
  return sim
}

const first = (n: string) => n.split(' ')[0]

/** Copie périodique de l'état de la simulation vers l'interface (4 fois par seconde) */
export function syncUi() {
  const cars: StaffRow[] = sim.vehicles
    .filter((v) => v.school)
    .map((v) => {
      const s = v.school!
      const st = first(s.lesson.student)
      const status =
        s.state === 'parked' ? `Au parking · attend ${st}`
        : s.state === 'lesson' ? `En leçon avec ${st}`
        : s.state === 'returning' ? `Retour de leçon avec ${st}`
        : `Départ en leçon avec ${st}`
      const dot = s.state === 'lesson' ? '#22c55e' : s.state === 'parked' ? '#94a3b8' : '#38bdf8'
      return { id: v.id, name: s.instructor, where: 'voiture' as const, status, dot, n: s.n, plate: s.plate, student: s.lesson.student, hour: s.lesson.hour, skill: s.lesson.skill, state: s.state }
    })
  const m = Math.floor(sim.clockMin)
  useUi.setState({
    staff: [...cars, ...STATIC_STAFF],
    events: sim.events.map((e) => ({ t: e.t, text: e.text })),
    clock: `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    light: sim.lightPhase(),
  })
}
