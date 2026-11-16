import { create } from 'zustand'
import { Sim, type SchoolState } from './sim/sim'
import { MODELS } from './assets'

export type TimeOfDay = 'day' | 'golden' | 'night'
export type Shot = 'free' | 'hero' | 'front' | 'lot' | 'cafe' | 'roundabout' | 'top' | 'chase'

export interface CarRow {
  id: string
  n: number
  plate: string
  instructor: string
  student: string
  hour: number
  skill: string
  state: SchoolState
  note: string
  kmh: number
  km: number
  stalls: number
}

interface UiState {
  tod: TimeOfDay
  shot: Shot
  cinema: boolean
  selected: string | null
  rows: CarRow[]
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
  rows: [],
  events: [],
  clock: '14:12',
  light: 'green',
  labels: !q.has('nolabels'),
  setTod: (tod) => set({ tod }),
  setShot: (shot) => set({ shot, cinema: false }),
  setCinema: (cinema) => set({ cinema }),
  select: (selected) => set(selected ? { selected, shot: 'chase', cinema: false } : { selected: null, shot: 'hero' }),
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

const STATE_KMH = (v: number) => Math.round(Math.abs(v) * 3.6)

/** Copie périodique de l'état de la simulation vers l'interface (4 fois par seconde) */
export function syncUi() {
  const rows: CarRow[] = sim.vehicles
    .filter((v) => v.school)
    .map((v) => {
      const s = v.school!
      return {
        id: v.id, n: s.n, plate: s.plate, instructor: s.instructor, student: s.lesson.student, hour: s.lesson.hour, skill: s.lesson.skill,
        state: s.state, note: s.note, kmh: STATE_KMH(v.v), km: s.km, stalls: s.stalls,
      }
    })
  const m = Math.floor(sim.clockMin)
  useUi.setState({
    rows,
    events: sim.events.map((e) => ({ t: e.t, text: e.text })),
    clock: `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    light: sim.lightPhase(),
  })
}
