import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { BUILDINGS, buildingById } from '../data/portfolio'
import { STREETS, artisanPath } from '../lib/geometry'
import { ACCENT } from '../lib/colors'
import { textTexture } from './textTexture'

// ── Personnage low-poly ────────────────────────────────────────
export function Person({ color = '#3b82f6', skin = '#f2c9a0', helmet = false, refObj }: { color?: string; skin?: string; helmet?: boolean; refObj?: React.Ref<THREE.Group> }) {
  return (
    <group ref={refObj}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.24, 0.4, 0.16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.32, 0.4, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {helmet && (
        <mesh position={[0, 1.06, 0]}>
          <boxGeometry args={[0.25, 0.07, 0.25]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      )}
    </group>
  )
}

function usePathFollower(points: [number, number][], offset = 0, loop = true) {
  const segs = useMemo(() => {
    const out: { a: THREE.Vector2; b: THREE.Vector2; len: number; acc: number }[] = []
    let acc = 0
    const n = loop ? points.length : points.length - 1
    for (let i = 0; i < n; i++) {
      const a = new THREE.Vector2(...points[i])
      const b = new THREE.Vector2(...points[(i + 1) % points.length])
      const len = a.distanceTo(b)
      out.push({ a, b, len, acc })
      acc += len
    }
    return { out, total: acc }
  }, [points, loop])

  return (dist: number) => {
    let d = dist + offset * segs.total
    d = loop ? ((d % segs.total) + segs.total) % segs.total : Math.min(d, segs.total - 0.001)
    const s = segs.out.find((s) => d >= s.acc && d < s.acc + s.len) ?? segs.out[segs.out.length - 1]
    const p = s.a.clone().lerp(s.b, (d - s.acc) / s.len)
    const angle = Math.atan2(s.b.x - s.a.x, s.b.y - s.a.y)
    return { x: p.x, z: p.y, angle, done: !loop && d >= segs.total - 0.01 }
  }
}

function Walker({ path, speed, offset, color, skin }: { path: [number, number][]; speed: number; offset: number; color: string; skin: string }) {
  const ref = useRef<THREE.Group>(null)
  const at = usePathFollower(path, offset)
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    const p = at(t * speed)
    g.position.set(p.x, 0.05 + Math.abs(Math.sin(t * speed * 9)) * 0.04, p.z)
    g.rotation.y = p.angle
  })
  return <Person refObj={ref} color={color} skin={skin} />
}

const SKINS = ['#f2c9a0', '#d9a273', '#8d5a3b', '#f5d5b8', '#b97f55']
const SHIRTS = ['#3b82f6', '#64748b', '#f97316', '#10b981', '#e11d48', '#a855f7', '#0ea5e9']

function Pedestrians() {
  const m = STREETS.middle
  const a = STREETS.avenue
  const sx = STREETS.side.x - STREETS.side.half - 0.6
  const loops: [number, number][][] = [
    [[-22, m.z - m.half - 0.6], [sx, m.z - m.half - 0.6], [sx, a.z - a.half - 0.6], [-22, a.z - a.half - 0.6]],
    [[-26, a.z + a.half + 0.6], [26, a.z + a.half + 0.6]],
    [[-22, m.z + m.half + 0.5], [sx - 0.4, m.z + m.half + 0.5]],
  ]
  const walkers = [
    { path: loops[0], speed: 0.9, offset: 0 },
    { path: loops[0], speed: 0.8, offset: 0.35 },
    { path: loops[0], speed: 1.0, offset: 0.7 },
    { path: loops[1], speed: 0.85, offset: 0.1 },
    { path: loops[1], speed: 0.7, offset: 0.6 },
    { path: loops[2], speed: 0.75, offset: 0.3 },
    { path: [...loops[0]].reverse(), speed: 0.85, offset: 0.5 },
  ]
  return (
    <>
      {walkers.map((w, i) => (
        <Walker key={i} {...w} color={SHIRTS[i % SHIRTS.length]} skin={SKINS[i % SKINS.length]} />
      ))}
    </>
  )
}

// ── Véhicules ──────────────────────────────────────────────────
export function Car({ color = '#f8fafc', refObj, position, rotation, van = false, label }: { color?: string; refObj?: React.Ref<THREE.Group>; position?: [number, number, number]; rotation?: number; van?: boolean; label?: string }) {
  const sign = useMemo(() => (label ? textTexture(label, { color: ACCENT, height: 110, width: 512 }) : null), [label])
  return (
    <group ref={refObj} position={position} rotation={[0, rotation ?? 0, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[van ? 2.1 : 1.8, van ? 0.55 : 0.42, 0.88]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={van ? [0.25, 0.85, 0] : [-0.1, 0.74, 0]} castShadow>
        <boxGeometry args={van ? [1.5, 0.45, 0.86] : [1.0, 0.32, 0.78]} />
        <meshStandardMaterial color={van ? color : '#334155'} roughness={0.3} />
      </mesh>
      {van && (
        <>
          <mesh position={[-0.72, 0.82, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.3} />
          </mesh>
          {sign && (
            <>
              <mesh position={[0.25, 0.6, 0.445]}>
                <planeGeometry args={[1.4, 0.3]} />
                <meshBasicMaterial map={sign} transparent toneMapped={false} />
              </mesh>
              <mesh position={[0.25, 0.6, -0.445]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[1.4, 0.3]} />
                <meshBasicMaterial map={sign} transparent toneMapped={false} />
              </mesh>
            </>
          )}
        </>
      )}
      {[
        [0.6, 0.45],
        [-0.6, 0.45],
        [0.6, -0.45],
        [-0.6, -0.45],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
    </group>
  )
}

function Driver({ path, speed, offset, color }: { path: [number, number][]; speed: number; offset: number; color: string }) {
  const ref = useRef<THREE.Group>(null)
  const at = usePathFollower(path, offset)
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const p = at(clock.elapsedTime * speed)
    g.position.set(p.x, 0.05, p.z)
    g.rotation.y = p.angle - Math.PI / 2
  })
  return <Car refObj={ref} color={color} />
}

function Traffic() {
  const a = STREETS.avenue
  const s = STREETS.side
  const m = STREETS.middle
  const east: [number, number][] = [[-70, a.z + 0.9], [70, a.z + 0.9]]
  const west: [number, number][] = [[70, a.z - 0.9], [-70, a.z - 0.9]]
  const loop: [number, number][] = [[s.x - 0.9, a.z - 3], [s.x - 0.9, -40], [s.x + 0.9, -40], [s.x + 0.9, a.z - 3]]
  const mid: [number, number][] = [[s.x - 2.5, m.z + 0.9], [-34, m.z + 0.9]]
  return (
    <>
      <Driver path={[...east, [70, a.z + 0.95]]} speed={4.2} offset={0} color="#f8fafc" />
      <Driver path={[...east, [70, a.z + 0.95]]} speed={4.2} offset={0.45} color={ACCENT} />
      <Driver path={[...west, [-70, a.z - 0.95]]} speed={3.8} offset={0.2} color="#64748b" />
      <Driver path={[...west, [-70, a.z - 0.95]]} speed={3.8} offset={0.75} color="#e2e8f0" />
      <Driver path={loop} speed={3} offset={0.1} color="#0f172a" />
      <Driver path={[...mid, [-34, m.z + 0.95]]} speed={2.6} offset={0.5} color="#cbd5e1" />
      {/* parking */}
      <Car position={[-3.1, 0.05, 7.4]} rotation={Math.PI / 2} color="#1e293b" />
      <Car position={[0.6, 0.05, 7.1]} rotation={Math.PI / 2} color="#f1f5f9" />
      <Car position={[2.45, 0.05, 7.3]} rotation={Math.PI / 2} color={ACCENT} />
    </>
  )
}

// ── Artisans en intervention ──────────────────────────────────
const TRADE_COLORS: Record<string, string> = {
  Plombier: '#2563eb',
  Électricien: '#f59e0b',
  Chauffagiste: '#ef4444',
  Serrurier: '#0f766e',
  Couvreur: '#92400e',
  Peintre: '#a855f7',
}

function ArtisanVisit({ lotId, trade, startAt, runId, hidden }: { lotId: string; trade: string; company: string; startAt: number; runId: string; hidden: boolean }) {
  const lot = useStore((s) => s.lots.find((l) => l.id === lotId))
  const b = lot ? buildingById[lot.buildingId] : BUILDINGS[0]
  const path = useMemo(() => artisanPath(b), [b])
  const ref = useRef<THREE.Group>(null)
  const at = usePathFollower(path.waypoints, 0, false)
  const t0 = useRef<number | null>(null)

  // Nouvelle mission sur le même lot → l'artisan repart du camion
  useEffect(() => {
    t0.current = null
  }, [runId])

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    if (t0.current === null) t0.current = clock.elapsedTime - startAt
    const walked = Math.max(0, clock.elapsedTime - t0.current - 0.6) * 1.3
    const p = at(walked)
    g.position.set(p.x, 0.05 + (p.done ? 0 : Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.04), p.z)
    g.rotation.y = p.done ? Math.PI : p.angle
  })

  if (!lot) return null
  return (
    <group visible={!hidden}>
      <Car position={[path.van[0], 0.05, path.van[1]]} rotation={0} van color="#ffffff" label={trade.toUpperCase()} />
      <group ref={ref}>
        <Person color={TRADE_COLORS[trade] ?? '#2563eb'} helmet />
      </group>
    </group>
  )
}

export function useVisits() {
  const lots = useStore((s) => s.lots)
  const dispatches = useStore((s) => s.dispatches)
  return useMemo(() => {
    // Une seule visite par lot, clé stable : on ne démonte jamais un artisan (évite un bug de drei/Html au démontage)
    const byLot = new Map<string, { lotId: string; trade: string; company: string; startAt: number; runId: string }>()
    for (const l of lots) {
      const live = l.interventions.find((i) => i.status === 'en_cours' && i.trade === 'Plombier')
      if (live) byLot.set(l.id, { lotId: l.id, trade: live.trade, company: live.company, startAt: 6, runId: live.id })
    }
    for (const d of dispatches) byLot.set(d.lotId, { lotId: d.lotId, trade: d.trade, company: d.company, startAt: 0, runId: d.id })
    return [...byLot.values()]
  }, [lots, dispatches])
}

function Artisans() {
  const mode = useStore((s) => s.mode)
  const visits = useVisits()
  return (
    <>
      {visits.map((v) => (
        <ArtisanVisit key={v.lotId} {...v} hidden={mode === 'dpe'} />
      ))}
    </>
  )
}

export function Life() {
  return (
    <>
      <Pedestrians />
      <Traffic />
      <Artisans />
    </>
  )
}
