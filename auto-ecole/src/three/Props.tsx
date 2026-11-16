import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hasModel, MODELS } from '../assets'
import { sim, useUi } from '../store'
import { CROSSING, FACADE_N, LANE, LOT, PARK, ROAD_HALF, ROUNDABOUT, SCHOOL, SIDE_STREET } from '../world'
import { Model } from './Model'
import { PRESETS } from './daylight'
import type { CastSpot } from './School'

const SW = 0.14 // hauteur du trottoir
const N = Math.PI // face au nord
const E = Math.PI / 2
const W = -Math.PI / 2
const R = ROUNDABOUT

// ── Terrasse du café, à l'angle de la rue transversale ─────────
const TERRACE_Z = FACADE_N + 0.75
const TABLES_X = [-32.2, -34.6, -37, -39.4, -41.8]
const seat = (x: number, z: number, heading: number, role: string): CastSpot => ({ x, z, y: SW, heading, anim: 'sit', role })

/** Personnes fixes à l'extérieur : terrasse (dont deux moniteurs en pause), bancs du square */
export const OUTDOOR_CAST: CastSpot[] = [
  seat(TABLES_X[0] - 0.62, TERRACE_Z, E, 'Moniteur · en pause jusqu’à 14 h 30'),
  seat(TABLES_X[0] + 0.62, TERRACE_Z, W, 'Moniteur · en pause jusqu’à 14 h 45'),
  seat(TABLES_X[1] - 0.62, TERRACE_Z, E, 'Client du café'),
  seat(TABLES_X[2] + 0.62, TERRACE_Z, W, 'Cliente du café'),
  seat(TABLES_X[3] - 0.62, TERRACE_Z, E, 'Client du café'),
  seat(TABLES_X[3] + 0.62, TERRACE_Z, W, 'Cliente du café'),
  { x: -30.6, z: TERRACE_Z + 0.5, y: SW, heading: W - 0.3, anim: 'idle', role: 'Serveur' },
  // bancs du square
  seat(-9, PARK.z0 + 5.6, N, 'Parent qui attend'),
  seat(9.4, PARK.z0 + 5.6, N, 'Élève · révise son code'),
  // devant l'auto-école : un moniteur attend son élève
  { x: SCHOOL.x1 - 1.2, z: SCHOOL.zFront + 1.3, y: SW, heading: 0.4, anim: 'idle', role: 'Moniteur · attend son élève' },
  { x: SCHOOL.x1 - 0.3, z: SCHOOL.zFront + 1.9, y: SW, heading: W + 0.5, anim: 'talk', role: 'Élève' },
]

function TrafficLight({ x, z, rotation }: { x: number; z: number; rotation: number }) {
  const mats = useRef<Record<string, THREE.MeshStandardMaterial>>({})
  const tune = (root: THREE.Object3D) => {
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const fix = (mat: THREE.Material) => {
        if (!mat.name.startsWith('light_')) return mat
        const c = (mats.current[mat.name] ??= (mat as THREE.MeshStandardMaterial).clone())
        c.emissive.set(mat.name === 'light_red' ? '#ff2a1a' : mat.name === 'light_orange' ? '#ff9a00' : '#22ff6a')
        return c
      }
      m.material = Array.isArray(m.material) ? m.material.map(fix) : fix(m.material)
    })
  }
  useFrame(() => {
    const phase = sim.lightPhase()
    const set = (k: string, on: boolean) => {
      const m = mats.current[k]
      if (m) m.emissiveIntensity = on ? 7 : 0.02
    }
    set('light_red', phase === 'red')
    set('light_orange', phase === 'orange')
    set('light_green', phase === 'green')
  })
  return <Model file="props/traffic-light" position={[x, SW, z]} rotation={rotation} tune={tune} fallback={[0.25, 3.2, 0.25]} fallbackColor="#2a2f36" />
}

function Lamps({ spots }: { spots: [number, number, number][] }) {
  const tod = useUi((s) => s.tod)
  const night = PRESETS[tod].night
  const tune = (root: THREE.Object3D) =>
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mat = m.material as THREE.MeshStandardMaterial
      if (mat.name === 'lamp') {
        mat.emissive.set('#ffd9a0')
        mat.emissiveIntensity = 0.05
        m.userData.glow = 3.2
        m.userData.glowDay = 0.05
      }
    })
  // quelques vraies sources la nuit, sans ombres, autour de la zone centrale
  const lights = spots.filter(([x]) => Math.abs(x) < 46).filter((_, i) => i % 2 === 0)
  return (
    <group>
      {spots.map(([x, z, rot], i) => (
        <Model key={i} file="props/street-lamp" position={[x, SW, z]} rotation={rot} tune={tune} fallback={[0.16, 7, 0.16]} fallbackColor="#30353d" />
      ))}
      {night > 0.5 &&
        lights.map(([x, z], i) => <pointLight key={i} position={[x, 6.2, z * 0.72]} color="#ffc98a" intensity={260 * night} distance={26} decay={1.7} />)}
    </group>
  )
}

/** Feuillage : découpe nette, double face, pas de reflets de ciel */
function tuneTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const mats = Array.isArray(m.material) ? m.material : [m.material]
    for (const mat of mats as THREE.MeshStandardMaterial[]) {
      if (!/leaves|leaf/.test(mat.name)) continue
      mat.transparent = false
      mat.alphaTest = 0.5
      mat.side = THREE.DoubleSide
      mat.envMapIntensity = 0.35
      if (!mat.userData.toned) {
        mat.color.multiplyScalar(0.78)
        mat.userData.toned = true
      }
      mat.roughness = 1
      mat.metalness = 0
    }
  })
}

export function Props() {
  const trees = useMemo(() => {
    const files = MODELS.props.filter((p) => p.file.includes('tree')).map((p) => p.file)
    const list: { file: string; x: number; z: number; s: number; r: number }[] = []
    let k = 0
    const add = (x: number, z: number, s = 1) => {
      if (!files.length) return
      list.push({ file: files[k % files.length], x, z, s: s * (0.9 + ((k * 37) % 20) / 100), r: (k * 2.4) % 6.28 })
      k++
    }
    const zN = -ROAD_HALF - 0.9
    const zS = ROAD_HALF + 0.9
    for (let x = -42; x <= 44; x += 12) {
      // pas d'arbre devant la vitrine ni devant les accès du parking
      const nearAccess = Math.abs(x - SIDE_STREET.x) < 5 || Math.abs(x - CROSSING.x) < 4
      if (!nearAccess && (x < SCHOOL.x0 - 4 || x > LOT.x1 + 1)) add(x, zN, 0.8)
      // côté sud : on dégage la vue sur l'auto-école et son parking
      if (x + 6 < -20 || x + 6 > 40) add(x + 6, zS, 0.85)
    }
    // square : grands arbres côté ouest seulement, la vue reste ouverte vers l'auto-école
    for (const x of [-26, -18]) for (const z of [PARK.z0 + 8, PARK.z0 + 17, PARK.z0 + 25]) add(x + ((z * 7) % 3) - 1, z, 1)
    add(-9, PARK.z1 - 3, 1.05)
    // îlots des giratoires
    for (const cx of [-R.x, R.x]) {
      add(cx, 0, 1.1)
      add(cx + 2.2, 1.6, 0.8)
      add(cx - 2, -1.8, 0.85)
    }
    // rue transversale
    for (let z = -16; z > -70; z -= 11) {
      add(SIDE_STREET.x - SIDE_STREET.half - 1, z, 0.9)
      add(SIDE_STREET.x + SIDE_STREET.half + 1, z - 5, 0.9)
    }
    // parvis au-delà des giratoires
    for (const sgn of [-1, 1]) for (const z of [-22, -12, 12, 22]) add(sgn * (R.x + 20), z, 1.2)
    return list
  }, [])

  const lamps = useMemo(() => {
    const out: [number, number, number][] = []
    for (let x = -48; x <= 48; x += 16) {
      // rien devant la vitrine de l'auto-école
      if (Math.abs(x - SIDE_STREET.x) > 4 && (x + 3 < SCHOOL.x0 - 1 || x + 3 > SCHOOL.x1 + 1.5)) out.push([x + 3, -ROAD_HALF - 0.55, 0])
      out.push([x - 5, ROAD_HALF + 0.55, N])
    }
    return out
  }, [])

  const cones: [number, number][] = [
    [LOT.x0 + 0.9, LOT.spotZ + 2.3], [LOT.x0 + 0.9, LOT.spotZ + 0.6], [LOT.x0 + 0.9, LOT.spotZ - 1.1],
    [LOT.spotsX[4] + 1.3, LOT.spotZ + 2.6], [LOT.x1 - 1.2, LOT.aisleZ + 4.2], [LOT.x1 - 1.2, LOT.aisleZ + 2.6],
  ]

  return (
    <group>
      {trees.map((t, i) => (
        <Model key={i} file={t.file} position={[t.x, SW, t.z]} rotation={t.r} scale={t.s} tune={tuneTree} />
      ))}
      {/* massifs bas côté est du square */}
      {[[14, PARK.z0 + 9], [21, PARK.z0 + 13], [25, PARK.z0 + 7], [17, PARK.z0 + 21], [24, PARK.z0 + 24]].map(([x, z], i) => (
        <Model key={`sh${i}`} file="props/shrub-01" position={[x, SW, z]} rotation={i * 1.3} scale={1 + (i % 3) * 0.25} tune={tuneTree} />
      ))}
      {!trees.length && null}
      <Lamps spots={lamps} />

      {/* feux du passage piéton */}
      <TrafficLight x={CROSSING.stopNorthLane + 0.7} z={-ROAD_HALF - 0.6} rotation={E} />
      <TrafficLight x={CROSSING.stopSouthLane - 0.7} z={ROAD_HALF + 0.6} rotation={W} />
      <Model file="props/sign-pedestrian-crossing" position={[CROSSING.x + 6, SW, -ROAD_HALF - 0.6]} rotation={E} />
      <Model file="props/sign-pedestrian-crossing" position={[CROSSING.x - 6, SW, ROAD_HALF + 0.6]} rotation={W} />

      {/* signalisation */}
      <Model file="props/sign-speed-30" position={[40, SW, -ROAD_HALF - 0.6]} rotation={E} />
      <Model file="props/sign-speed-30" position={[-40, SW, ROAD_HALF + 0.6]} rotation={W} />
      <Model file="props/sign-roundabout" position={[-R.x + R.outerR + 9, SW, -ROAD_HALF - 0.6]} rotation={E} />
      <Model file="props/sign-roundabout" position={[R.x - R.outerR - 9, SW, ROAD_HALF + 0.6]} rotation={W} />
      <Model file="props/sign-yield" position={[-R.x + R.outerR + 2.5, SW, -ROAD_HALF - 0.6]} rotation={E} />
      <Model file="props/sign-yield" position={[R.x - R.outerR - 2.5, SW, ROAD_HALF + 0.6]} rotation={W} />
      <Model file="props/sign-parking" position={[LOT.entryX + 3.2, SW, FACADE_N + 0.5]} rotation={E} />
      <Model file="props/sign-no-entry" position={[LOT.exitX + 3.1, SW, -ROAD_HALF - 0.6]} rotation={0} />
      <Model file="props/sign-stop" position={[SIDE_STREET.x + SIDE_STREET.half + 0.6, SW, -ROAD_HALF - 1.2]} rotation={N} />

      {/* cônes de manœuvre sur le parking */}
      {cones.map(([x, z], i) => (
        <Model key={i} file="props/traffic-cone" position={[x, 0, z]} fallback={[0.28, 0.5, 0.28]} fallbackColor="#f26a1b" />
      ))}

      {/* mobilier devant l'auto-école */}
      {[SCHOOL.x0 + 1, SCHOOL.x0 + 4, SCHOOL.x0 + 7, SCHOOL.x0 + 10].map((x) => (
        <Model key={x} file="props/bollard" position={[x, SW, -ROAD_HALF - 0.45]} />
      ))}
      <Model file="props/bike-rack" position={[SCHOOL.x0 + 1.6, SW, SCHOOL.zFront + 0.75]} rotation={E} />
      <Model file="props/trash-bin" position={[SCHOOL.x1 + 0.6, SW, FACADE_N + 0.5]} />
      <Model file="props/planter" position={[SCHOOL.x0 + 5.2, SW, SCHOOL.zFront + 0.75]} />
      <Model file="props/planter" position={[SCHOOL.x0 + 8.4, SW, SCHOOL.zFront + 0.75]} />

      {/* côté sud : abribus, bancs, corbeilles */}
      <Model file="props/bus-shelter" position={[22, SW, ROAD_HALF + 2.2]} rotation={N} />
      <Model file="props/bench" position={[-9, SW, PARK.z0 + 5.9]} rotation={N} fallback={[1.8, 0.45, 0.5]} fallbackColor="#6b5a45" />
      <Model file="props/bench" position={[9.4, SW, PARK.z0 + 5.9]} rotation={N} fallback={[1.8, 0.45, 0.5]} fallbackColor="#6b5a45" />
      <Model file="props/bench" position={[-6.8, SW, (PARK.z0 + PARK.z1) / 2 + 2]} rotation={E} />
      <Model file="props/bench" position={[6.8, SW, (PARK.z0 + PARK.z1) / 2 + 2]} rotation={W} />
      <Model file="props/trash-bin" position={[-11.5, SW, PARK.z0 + 5.6]} />
      <Model file="props/trash-bin" position={[12, SW, ROAD_HALF + 0.8]} />
      <Model file="props/fire-hydrant" position={[32, SW, -ROAD_HALF - 0.6]} />

      {/* terrasse du café */}
      {TABLES_X.map((x) => (
        <group key={x}>
          <Model file="props/cafe-table" position={[x, SW, TERRACE_Z]} fallback={[0.6, 0.72, 0.6]} fallbackColor="#3a3a3a" />
          <Model file="props/cafe-chair" position={[x - 0.62, SW, TERRACE_Z]} rotation={E} />
          <Model file="props/cafe-chair" position={[x + 0.62, SW, TERRACE_Z]} rotation={W} />
        </group>
      ))}
      {hasModel('props/parasol') && [TABLES_X[0] - 0.1, TABLES_X[2], TABLES_X[4] + 0.1].map((x) => <Model key={x} file="props/parasol" position={[x, SW, TERRACE_Z + 0.15]} />)}
    </group>
  )
}

export const LANE_Z = LANE
