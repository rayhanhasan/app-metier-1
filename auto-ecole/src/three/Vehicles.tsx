import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODELS, modelInfo, modelUrl } from '../assets'
import { sim, useUi } from '../store'
import type { Vehicle } from '../sim/sim'
import { BRAND, LOT } from '../world'
import { canvasTexture, FONT } from './materials'
import { nightFactor } from './daylight'
import { Occupant } from './People'

const SCHOOL_CAR = 'cars/peugeot-208'

interface Rig {
  root: THREE.Object3D
  wheels: { node: THREE.Object3D; front: boolean; left: boolean }[]
  rear: THREE.MeshStandardMaterial[]
  front: THREE.MeshStandardMaterial[]
}

/** Clone le modèle, isole les matériaux pilotés (peinture, feux) et repère les roues. */
function buildRig(scene: THREE.Object3D, color: string): Rig {
  const root = scene.clone(true)
  const cache = new Map<THREE.Material, THREE.Material>()
  const rear: THREE.MeshStandardMaterial[] = []
  const front: THREE.MeshStandardMaterial[] = []
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    m.castShadow = true
    m.receiveShadow = true
    const apply = (mat: THREE.Material) => {
      const name = mat.name.toLowerCase()
      const piloted = name === 'paint' || name.startsWith('light') || name === 'glass'
      if (!piloted) return mat
      let c = cache.get(mat)
      if (!c) {
        c = mat.clone()
        cache.set(mat, c)
        const s = c as THREE.MeshPhysicalMaterial
        if (name === 'paint') {
          s.color.set(color)
          // les teintes claires sont des laques opaques, les foncées des métallisées
          const light = s.color.getHSL({ h: 0, s: 0, l: 0 }).l > 0.6
          s.metalness = light ? 0.08 : 0.6
          s.roughness = light ? 0.32 : 0.4
          if ('clearcoat' in s) {
            s.clearcoat = 1
            s.clearcoatRoughness = 0.05
          }
          s.envMapIntensity = 1.25
        } else if (name === 'glass') {
          s.transparent = true
          s.opacity = 0.3
          s.color.set('#1a2630')
          s.roughness = 0.03
          s.metalness = 0.1
          s.envMapIntensity = 2
          s.depthWrite = false
        } else if (name === 'light_rear') {
          s.emissive.set('#ff1a10')
          rear.push(s)
        } else if (name === 'light_front') {
          s.emissive.set('#f4f7ff')
          front.push(s)
        }
      }
      return c
    }
    m.material = Array.isArray(m.material) ? m.material.map(apply) : apply(m.material)
  })
  const wheels: Rig['wheels'] = []
  for (const key of ['wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR']) {
    const node = root.getObjectByName(key)
    if (node) wheels.push({ node, front: key[6] === 'F', left: key[7] === 'L' })
  }
  return { root, wheels, rear, front }
}

function useRoofSign() {
  return canvasTexture('roof-sign', 512, 160, (g, w, h) => {
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#fff'
    g.lineWidth = 8
    g.strokeRect(6, 6, w - 12, h - 12)
    g.fillStyle = '#fff'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `800 78px ${FONT}`
    g.fillText('AUTO-ÉCOLE', w / 2, h / 2 + 4)
  })
}

const beamTex = () =>
  canvasTexture('beam2', 128, 256, (g, w, h) => {
    // faisceau en éventail : intense près du pare-chocs, nul sur tous les bords du rectangle
    const img = g.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = 1 - y / h // 0 = près de la voiture
        const spread = 0.16 + v * 0.34
        const u = Math.abs(x / w - 0.5) / spread
        const side = Math.max(0, 1 - u * u)
        const along = Math.pow(Math.max(0, 1 - v), 1.6) * Math.min(1, v * 9)
        const a = side * along
        const i = (y * w + x) * 4
        img.data[i] = 255
        img.data[i + 1] = 246
        img.data[i + 2] = 222
        img.data[i + 3] = Math.round(a * 255)
      }
    }
    g.putImageData(img, 0, 0)
  })

function Car({ v, file }: { v: Vehicle; file: string }) {
  const { scene } = useGLTF(modelUrl(file))
  const info = modelInfo(file)
  const height = info?.size?.[1] ?? 1.45
  const length = info?.size?.[2] ?? 4.05
  const width = info?.size?.[0] ?? 1.75
  const rig = useMemo(() => buildRig(scene, v.color), [scene, v.color])
  const group = useRef<THREE.Group>(null)
  const blinkL = useRef<THREE.Group>(null)
  const blinkR = useRef<THREE.Group>(null)
  const reverse = useRef<THREE.Mesh>(null)
  const beam = useRef<THREE.Mesh>(null)
  const crew = useRef<THREE.Group>(null)
  const people = MODELS.people.map((p) => p.file)
  const idx = Number(v.id.replace(/\D/g, '')) || 0
  const select = useUi((s) => s.select)
  const sign = useRoofSign()
  const isSchool = v.kind === 'school'
  const hx = width / 2 - 0.12
  const hz = length / 2 - 0.06

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    g.position.set(v.x, 0, v.z)
    g.rotation.y = v.heading
    for (const w of rig.wheels) w.node.rotation.set(v.wheelSpin, w.front ? v.steer : 0, 0, 'YXZ')
    const night = nightFactor()
    const parked = v.school?.state === 'parked'
    for (const m of rig.rear) m.emissiveIntensity = v.braking && !parked ? 5 : parked ? 0 : 0.5 + night * 1.2
    for (const m of rig.front) m.emissiveIntensity = parked ? 0 : 0.35 + night * 4.5
    const on = Math.floor(clock.elapsedTime * 2.6) % 2 === 0
    const hazard = (v.school?.stallTimer ?? 0) > 0
    if (blinkL.current) blinkL.current.visible = on && (v.blinker === 1 || hazard)
    if (blinkR.current) blinkR.current.visible = on && (v.blinker === -1 || hazard)
    if (reverse.current) reverse.current.visible = v.reversing
    if (crew.current) crew.current.visible = !parked
    if (beam.current) {
      beam.current.visible = night > 0.2 && !parked
      ;(beam.current.material as THREE.MeshBasicMaterial).opacity = night * 0.5
    }
  })

  return (
    <group
      ref={group}
      onClick={(e) => {
        if (!isSchool) return
        e.stopPropagation()
        select(v.id)
      }}
      onPointerOver={() => isSchool && (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <primitive object={rig.root} />
      {/* à bord : l'élève conduit (à gauche), le moniteur est passager */}
      {people.length > 0 && (
        <group ref={crew}>
          <Occupant file={people[(idx * 2 + (isSchool ? 0 : 3)) % people.length]} side={1} anim="drive" />
          {isSchool && <Occupant file={people[(idx * 2 + 1) % people.length]} side={-1} anim="sit" />}
        </group>
      )}
      {/* clignotants (avant + arrière), côté gauche = +X quand la voiture regarde +Z */}
      {[
        [blinkL, 1],
        [blinkR, -1],
      ].map(([ref, side]) => (
        <group key={side as number} ref={ref as React.RefObject<THREE.Group>} visible={false}>
          {[hz, -hz].map((z) => (
            <mesh key={z} position={[(side as number) * hx, 0.68, z]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#ff8a00" emissive="#ff8a00" emissiveIntensity={6} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh ref={reverse} position={[0.45, 0.62, -hz - 0.02]} visible={false}>
        <boxGeometry args={[0.16, 0.07, 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      {/* halo des phares sur la chaussée (nuit) */}
      <mesh ref={beam} position={[0, 0.03, hz + 5.2]} rotation={[-Math.PI / 2, 0, Math.PI]} visible={false}>
        <planeGeometry args={[5.5, 10.5]} />
        <meshBasicMaterial map={beamTex()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {isSchool && (
        <group position={[0, height + 0.02, -0.15]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.5, 0.05, 0.3]} />
            <meshStandardMaterial color="#1b1f26" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow userData={{ glow: 1.4 }}>
            <boxGeometry args={[0.72, 0.22, 0.14]} />
            <meshStandardMaterial color={BRAND.color} roughness={0.45} />
          </mesh>
          {[0.071, -0.071].map((z, i) => (
            <mesh key={z} position={[0, 0.16, z]} rotation={[0, i ? Math.PI : 0, 0]} userData={{ glow: 1.4 }}>
              <planeGeometry args={[0.7, 0.21]} />
              <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.3} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

/** Voiture de repli, si aucun modèle n'est disponible */
function BoxCar({ v }: { v: Vehicle }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    group.current?.position.set(v.x, 0, v.z)
    if (group.current) group.current.rotation.y = v.heading
  })
  return (
    <group ref={group}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.75, 0.7, 4.05]} />
        <meshStandardMaterial color={v.color} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.55, 2.2]} />
        <meshStandardMaterial color="#1a222c" roughness={0.2} />
      </mesh>
    </group>
  )
}

/** Voitures garées en permanence (places libres du parking, stationnement le long du square) */
function ParkedCar({ file, x, z, heading, color }: { file: string; x: number; z: number; heading: number; color: string }) {
  const { scene } = useGLTF(modelUrl(file))
  const rig = useMemo(() => buildRig(scene, color), [scene, color])
  return <primitive object={rig.root} position={[x, 0, z]} rotation={[0, heading, 0]} />
}

export function Vehicles() {
  const traffic = MODELS.cars.filter((c) => c.file !== SCHOOL_CAR)
  const hasSchoolCar = MODELS.cars.some((c) => c.file === SCHOOL_CAR)
  const fileFor = (v: Vehicle) => (v.kind === 'school' ? (hasSchoolCar ? SCHOOL_CAR : traffic[0]?.file) : (traffic[v.model % Math.max(1, traffic.length)]?.file ?? (hasSchoolCar ? SCHOOL_CAR : undefined)))
  const parked = useMemo(() => {
    const pool = traffic.length ? traffic.map((t) => t.file) : hasSchoolCar ? [SCHOOL_CAR] : []
    if (!pool.length) return []
    const colors = ['#2b3440', '#7c1d1d', '#d8d9dc', '#3f5670']
    return [
      { file: pool[0], x: LOT.spotsX[5], z: LOT.spotZ + 0.2, heading: Math.PI, color: colors[0] },
      { file: pool[1 % pool.length], x: LOT.spotsX[6], z: LOT.spotZ - 0.1, heading: Math.PI, color: colors[1] },
    ]
  }, [traffic, hasSchoolCar])

  return (
    <group>
      {sim.vehicles.map((v) => {
        const file = fileFor(v)
        return file ? <Car key={v.id} v={v} file={file} /> : <BoxCar key={v.id} v={v} />
      })}
      {parked.map((p, i) => (
        <ParkedCar key={i} {...p} />
      ))}
    </group>
  )
}
