import { LIGHT, LIGHT_CYCLE, LOT, lightPhase, pedestriansMayCross } from '../world'
import { sample, type Path, type Pose } from './path'
import { LOOP, S, SPOTS, WALKS, type WalkRoute } from './routes'

// ─────────────────────────────────────────────────────────────
//  Simulation : voitures (école + trafic), feux, piétons.
//  État mutable mis à jour à chaque image, lu directement par le rendu.
// ─────────────────────────────────────────────────────────────

export type SchoolState = 'parked' | 'reversing' | 'exiting' | 'lesson' | 'returning'

export interface Lesson {
  student: string
  hour: number // heure n° sur 20
  skill: string
}

export interface SchoolInfo {
  n: number
  plate: string
  instructor: string
  spot: number
  state: SchoolState
  timer: number
  wantsReturn: boolean
  holdsLot: boolean
  queue: Lesson[]
  lesson: Lesson
  km: number
  stalls: number
  stallTimer: number
  wasStoppedAtLight: boolean
  note: string
}

export interface Vehicle {
  id: string
  kind: 'school' | 'traffic'
  model: number
  color: string
  x: number
  z: number
  heading: number
  steer: number
  wheelSpin: number
  v: number
  braking: boolean
  blinker: -1 | 0 | 1
  reversing: boolean
  path: Path
  s: number
  dir: 1 | -1
  sEnd: number
  onLoop: boolean
  vmax: number
  aLat: number
  school?: SchoolInfo
}

export interface Walker {
  id: string
  model: number
  route: WalkRoute
  s: number
  speed: number
  v: number
  x: number
  z: number
  heading: number
}

export interface SimEvent {
  t: number
  text: string
  carId?: string
}

const SKILLS = ['Giratoires', 'Insertion et priorités', 'Stationnement en bataille', 'Allure et distances', 'Feux et passages piétons', 'Démarrage et arrêt de précision']

const TEAM: { instructor: string; students: string[] }[] = [
  { instructor: 'Karim B.', students: ['Léa Fontaine', 'Hugo Marchand', 'Inès Haddad'] },
  { instructor: 'Sophie L.', students: ['Tom Girard', 'Chloé Perrin', 'Yanis Benali'] },
  { instructor: 'Julien M.', students: ['Manon Roux', 'Lucas Morel', 'Sarah Nguyen'] },
  { instructor: 'Nadia R.', students: ['Paul Lemaire', 'Jade Colin', 'Nathan Blanc'] },
  { instructor: 'Éric D.', students: ['Emma Boyer', 'Mehdi Chevalier', 'Zoé Lambert'] },
]

const TRAFFIC_COLORS = ['#c9ccd1', '#1f2a37', '#8a1c1c', '#e9e9e6', '#3b5a7a', '#5b5f66', '#2f4a3a', '#b9a57a']

const pose: Pose = { x: 0, z: 0, heading: 0, curv: 0 }
const WHEELBASE = 2.54
const WHEEL_R = 0.315
const A_BRAKE = 1.9
const A_BRAKE_MAX = 4.2

function mod(a: number, n: number) {
  return ((a % n) + n) % n
}

export class Sim {
  t = 0
  /** heure affichée (minutes depuis minuit) */
  clockMin = 14 * 60 + 12
  vehicles: Vehicle[] = []
  walkers: Walker[] = []
  events: SimEvent[] = []
  lotBusy = false
  private seed = 20261116

  private rnd() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0
    return this.seed / 4294967296
  }

  constructor(trafficModels: number, walkerModels: number) {
    // ── voitures de l'école ──
    TEAM.forEach((team, i) => {
      const queue: Lesson[] = team.students.map((student, k) => ({ student, hour: 4 + ((i * 5 + k * 7) % 15), skill: SKILLS[(i + k * 2) % SKILLS.length] }))
      const lesson = queue.shift()!
      queue.push(lesson)
      const sp = SPOTS[i]
      const onRoad = i === 1 || i === 3
      const v: Vehicle = {
        id: `ae-${i + 1}`,
        kind: 'school',
        model: -1,
        color: '#f3f4f6',
        x: 0, z: 0, heading: 0, steer: 0, wheelSpin: 0, v: 0,
        braking: false, blinker: 0, reversing: false,
        path: sp.inPath, s: sp.inPath.total, dir: 1, sEnd: sp.inPath.total,
        onLoop: false, vmax: 6.6, aLat: 1.15,
        school: {
          n: i + 1,
          plate: `${'GH GK GM GP GR'.split(' ')[i]}-${214 + i * 137}-${'LY NB TR VD ZA'.split(' ')[i]}`,
          instructor: team.instructor,
          spot: i,
          state: 'parked',
          timer: [6, 0, 34, 0, 62][i],
          wantsReturn: false,
          holdsLot: false,
          queue,
          lesson,
          km: 0,
          stalls: 0,
          stallTimer: 0,
          wasStoppedAtLight: false,
          note: 'En attente de l’élève',
        },
      }
      if (onRoad) {
        v.path = LOOP
        v.onLoop = true
        v.s = i === 1 ? LOOP.total * 0.36 : LOOP.total * 0.8
        v.v = 5
        v.school!.state = 'lesson'
        v.school!.timer = i === 1 ? 75 : 130
        v.school!.note = 'En leçon'
      }
      this.vehicles.push(v)
    })
    // ── trafic ──
    const n = 6
    for (let i = 0; i < n; i++) {
      this.vehicles.push({
        id: `tr-${i}`,
        kind: 'traffic',
        model: trafficModels ? i % trafficModels : 0,
        color: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length],
        x: 0, z: 0, heading: 0, steer: 0, wheelSpin: 0, v: 6,
        braking: false, blinker: 0, reversing: false,
        path: LOOP, s: mod(LOOP.total * (0.05 + i / n) + this.rnd() * 6, LOOP.total), dir: 1, sEnd: 0,
        onLoop: true, vmax: 7.6 + this.rnd() * 1.4, aLat: 1.7,
      })
    }
    // ── piétons ──
    const perRoute = [6, 5, 4, 4]
    let k = 0
    WALKS.forEach((route, r) => {
      for (let i = 0; i < perRoute[r]; i++) {
        this.walkers.push({
          id: `w-${k}`,
          model: walkerModels ? k % walkerModels : 0,
          route,
          s: route.path.total * ((i + this.rnd() * 0.6) / perRoute[r]),
          speed: 1.15 + this.rnd() * 0.4,
          v: 0, x: 0, z: 0, heading: 0,
        })
        k++
      }
    })
    for (const v of this.vehicles) this.place(v)
    for (const w of this.walkers) this.placeWalker(w)
  }

  private log(text: string, carId?: string) {
    this.events.unshift({ t: this.clockMin, text, carId })
    if (this.events.length > 8) this.events.length = 8
  }

  private place(v: Vehicle) {
    sample(v.path, v.s, pose)
    v.x = pose.x
    v.z = pose.z
    v.heading = pose.heading
    const target = Math.atan(WHEELBASE * pose.curv)
    v.steer += (target - v.steer) * 0.25
  }

  private placeWalker(w: Walker) {
    sample(w.route.path, w.s, pose)
    w.x = pose.x
    w.z = pose.z
    w.heading = pose.heading
  }

  step(dt: number) {
    dt = Math.min(dt, 0.05)
    this.t += dt
    this.clockMin += dt / 12 // 1 s réelle = 5 s simulées
    const phase = lightPhase(this.t)

    for (const v of this.vehicles) this.stepVehicle(v, dt, phase)
    const walk = pedestriansMayCross(this.t)
    for (const w of this.walkers) this.stepWalker(w, dt, walk)
  }

  // ── Piétons ──
  private stepWalker(w: Walker, dt: number, mayCross: boolean) {
    const total = w.route.path.total
    let target = w.speed
    for (const g of w.route.gates) {
      const d = mod(g - w.s, total)
      if (d < 0.9 && !mayCross) target = 0
    }
    // évite de marcher sur le piéton de devant
    for (const o of this.walkers) {
      if (o === w || o.route !== w.route) continue
      const d = mod(o.s - w.s, total)
      if (d > 0 && d < 0.9) target = Math.min(target, o.v * 0.9)
    }
    w.v += (target - w.v) * Math.min(1, dt * 4)
    w.s = mod(w.s + w.v * dt, total)
    this.placeWalker(w)
  }

  // ── Voitures ──
  private stepVehicle(v: Vehicle, dt: number, phase: 'green' | 'orange' | 'red') {
    const sc = v.school
    if (sc) this.stepSchoolState(v, sc, dt)
    const path = v.path
    let allowed = v.vmax

    if (sc && (sc.state === 'parked' || sc.stallTimer > 0)) {
      if (sc.stallTimer > 0) sc.stallTimer -= dt
      v.braking = sc.state !== 'parked'
      v.v = 0
      return
    }

    // 1. Vitesse limitée par les virages à venir
    const reverse = v.dir === -1
    if (reverse) allowed = Math.min(allowed, 1.5)
    for (let d = 0; d <= 26; d += 2) {
      const sAhead = v.s + v.dir * d
      if (!path.closed && (sAhead < 0 || sAhead > path.total)) break
      sample(path, sAhead, pose)
      const k = Math.abs(pose.curv)
      if (k > 0.004) {
        const vc = Math.sqrt(v.aLat / k)
        allowed = Math.min(allowed, Math.sqrt(vc * vc + 2 * A_BRAKE * d))
      }
    }

    // 2. Arrêts : fin de trajectoire, feux, insertion, voiture ou piéton devant
    let stopDist = Infinity
    if (!v.onLoop) {
      const toEnd = (v.sEnd - v.s) * v.dir
      const mustStop = sc && (sc.state === 'returning' || sc.state === 'reversing')
      if (mustStop) stopDist = Math.min(stopDist, toEnd)
      if (sc && sc.state === 'exiting') {
        // céder le passage avant de s'insérer sur le boulevard
        const gate = path.total - 9.5
        const dGate = gate - v.s
        if (dGate > -0.5 && this.loopBusyAtJoin()) stopDist = Math.min(stopDist, Math.max(0, dGate))
      }
    } else {
      for (const stop of [S.stopNorth, S.stopSouth]) {
        const d = mod(stop - v.s, LOOP.total) - 2.4
        if (d < -0.6 || d > 45) continue
        if (phase === 'red') stopDist = Math.min(stopDist, Math.max(0, d))
        else if (phase === 'orange' && d > (v.v * v.v) / (2 * 2.8)) stopDist = Math.min(stopDist, Math.max(0, d))
      }
      // laisser passer une voiture de l'école déjà engagée dans son insertion
      for (const o of this.vehicles) {
        if (o.school?.state !== 'exiting' || o.s < o.path.total - 9.5) continue
        const d = mod(S.join - v.s, LOOP.total)
        if (d < 34) stopDist = Math.min(stopDist, d - 7.5)
      }
      if (sc && sc.wantsReturn && !this.lotBusy) {
        // ralentir avant de tourner vers le parking
        const d = mod(S.leave - v.s, LOOP.total)
        if (d < 40) allowed = Math.min(allowed, Math.sqrt(3.2 * 3.2 + 2 * A_BRAKE * d))
      }
    }

    const fx = Math.sin(v.heading) * v.dir
    const fz = Math.cos(v.heading) * v.dir
    for (const o of this.vehicles) {
      if (o === v) continue
      if (o.school?.state === 'parked') continue
      if (v.onLoop && o.onLoop) {
        // sur la boucle : écart mesuré le long de la trajectoire (exact dans les giratoires)
        const gap = mod(o.s - v.s, LOOP.total)
        if (gap < 32) stopDist = Math.min(stopDist, gap - 6.4 - v.v * 0.7)
        continue
      }
      const dx = o.x - v.x
      const dz = o.z - v.z
      const fwd = dx * fx + dz * fz
      if (fwd < 0.5 || fwd > 30) continue
      const lat = Math.abs(dx * fz - dz * fx)
      if (lat > 1.5 + fwd * 0.05) continue
      // même sens de marche (ou véhicule à l'arrêt) uniquement
      const same = Math.sin(o.heading) * o.dir * fx + Math.cos(o.heading) * o.dir * fz
      if (same < 0.2 && Math.abs(o.v) > 0.5) continue
      stopDist = Math.min(stopDist, fwd - 6.2 - v.v * 0.6)
    }
    if (!v.onLoop || sc) {
      for (const w of this.walkers) {
        const dx = w.x - v.x
        const dz = w.z - v.z
        const fwd = dx * fx + dz * fz
        if (fwd < 0.5 || fwd > 9) continue
        if (Math.abs(dx * fz - dz * fx) > 1.6) continue
        stopDist = Math.min(stopDist, fwd - 4)
      }
    }

    if (stopDist < Infinity) allowed = Math.min(allowed, Math.max(0.35, Math.sqrt(2 * A_BRAKE * Math.max(0, stopDist))))
    if (stopDist <= 0.06) allowed = 0

    // 3. Accélération / freinage
    const before = v.v
    if (v.v < allowed) v.v = Math.min(allowed, v.v + (sc ? 1.05 : 1.5) * dt)
    else v.v = Math.max(allowed, v.v - A_BRAKE_MAX * dt)
    v.braking = v.v < before - 0.2 * dt || (v.v < 0.05 && stopDist < 3)

    // l'élève cale parfois en redémarrant au feu
    if (sc && v.onLoop) {
      const atLight = v.v < 0.05 && phase !== 'green' && stopDist < 1
      if (sc.wasStoppedAtLight && phase === 'green' && this.rnd() < 0.3) {
        sc.stallTimer = 2.6
        sc.stalls++
        sc.note = 'A calé au feu'
        this.log(`${sc.lesson.student.split(' ')[0]} a calé au feu`, v.id)
      }
      sc.wasStoppedAtLight = atLight
    }

    // 4. Déplacement
    const ds = v.v * dt
    v.s += v.dir * ds
    if (path.closed) v.s = mod(v.s, path.total)
    else v.s = Math.max(0, Math.min(path.total, v.s))
    v.wheelSpin += (v.dir * ds) / WHEEL_R
    if (sc) sc.km += ds / 1000
    v.reversing = reverse
    this.place(v)

    // clignotant : selon le virage qui arrive hors boulevard, ou avant de quitter la boucle
    v.blinker = 0
    if (!v.onLoop) {
      sample(path, v.s + v.dir * 5, pose)
      if (Math.abs(pose.curv) > 0.06) v.blinker = pose.curv > 0 ? 1 : -1
      if (sc?.state === 'exiting' && v.s > path.total - 16) v.blinker = -1
    } else if (sc?.wantsReturn && !this.lotBusy && mod(S.leave - v.s, LOOP.total) < 35) v.blinker = -1
  }

  private loopBusyAtJoin(): boolean {
    for (const o of this.vehicles) {
      if (!o.onLoop) continue
      const d = mod(S.join - o.s, LOOP.total)
      if (d < Math.max(14, o.v * 5.5 + 6) || d > LOOP.total - 7.5) return true
    }
    return false
  }

  private stepSchoolState(v: Vehicle, sc: SchoolInfo, dt: number) {
    const sp = SPOTS[sc.spot]
    const first = sc.lesson.student.split(' ')[0]
    switch (sc.state) {
      case 'parked':
        sc.timer -= dt
        if (sc.timer <= 0 && !this.lotBusy) {
          this.lotBusy = true
          sc.holdsLot = true
          sc.state = 'reversing'
          sc.note = 'Sort de sa place en marche arrière'
          v.path = sp.inPath
          v.s = sp.inPath.total
          v.dir = -1
          v.sEnd = sp.inPath.total - sp.backLen
          this.log(`208 n° ${sc.n} : départ en leçon, ${first} au volant`, v.id)
        }
        break
      case 'reversing':
        if (v.s <= v.sEnd + 0.05 && v.v < 0.05) {
          sc.state = 'exiting'
          sc.note = 'Quitte le parking'
          v.path = sp.outPath
          v.s = 0
          v.dir = 1
          v.sEnd = sp.outPath.total
          v.reversing = false
        }
        break
      case 'exiting':
        if (v.s >= v.path.total - 0.05) {
          sc.state = 'lesson'
          sc.note = `Travaille : ${sc.lesson.skill.toLowerCase()}`
          sc.timer = 95 + this.rnd() * 60
          sc.wantsReturn = false
          v.path = LOOP
          v.s = S.join
          v.onLoop = true
          this.lotBusy = false
          sc.holdsLot = false
        }
        break
      case 'lesson': {
        sc.timer -= dt
        if (sc.stallTimer <= 0 && sc.note === 'A calé au feu') sc.note = `Travaille : ${sc.lesson.skill.toLowerCase()}`
        if (sc.timer <= 0 && !sc.wantsReturn) {
          sc.wantsReturn = true
          sc.note = 'Retour à l’auto-école'
        }
        const d = mod(S.leave - v.s, LOOP.total)
        if (sc.wantsReturn && !this.lotBusy && (d < 0.8 || d > LOOP.total - 0.5)) {
          this.lotBusy = true
          sc.holdsLot = true
          sc.state = 'returning'
          sc.note = 'Se gare en bataille'
          v.path = sp.inPath
          v.s = 0
          v.dir = 1
          v.sEnd = sp.inPath.total
          v.onLoop = false
        }
        break
      }
      case 'returning':
        if (v.s >= v.path.total - 0.05 && v.v < 0.05) {
          sc.state = 'parked'
          sc.timer = 26 + this.rnd() * 30
          this.lotBusy = false
          sc.holdsLot = false
          this.log(`208 n° ${sc.n} : leçon terminée pour ${first}`, v.id)
          const next = sc.queue.shift()!
          sc.queue.push(next)
          sc.lesson = { ...next, hour: Math.min(20, next.hour + 1) }
          sc.note = `Changement d’élève : ${next.student.split(' ')[0]} s’installe`
          sc.wantsReturn = false
        }
        break
    }
  }

  lightPhase() {
    return lightPhase(this.t)
  }
  lightProgress() {
    return mod(this.t, LIGHT_CYCLE) / LIGHT_CYCLE
  }
}

export const LOT_INFO = LOT
export const LIGHT_INFO = LIGHT
