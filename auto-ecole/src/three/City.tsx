import { useMemo } from 'react'
import * as THREE from 'three'
import { MODELS, type ModelInfo } from '../assets'
import { FACADE_N, FACADE_S, LOT, ROUNDABOUT, SIDE_STREET } from '../world'
import { Model } from './Model'
import { litWindows } from './shaders'

const SW = 0.14
const R = ROUNDABOUT

interface Placed {
  key: string
  file?: string
  x: number
  z: number
  rot: number
  scale: [number, number, number]
  size: [number, number, number]
}

interface Row {
  /** début et fin le long de la rue */
  from: number
  to: number
  /** position de la ligne de façade */
  line: number
  /** 'N' = rue est-ouest, façades vers le sud ; 'S' = vers le nord ; 'E' / 'W' = rue nord-sud, façades vers l'est / l'ouest */
  facing: 'S' | 'N' | 'E' | 'W'
  seed: number
  /** types souhaités en priorité (ex. commerce d'angle) */
  first?: string
  scale?: number
}

const ROWS: Row[] = [
  // rive nord du boulevard
  { from: -47.5, to: SIDE_STREET.x - 5, line: FACADE_N, facing: 'S', seed: 1, first: 'brasserie' },
  { from: LOT.x1 + 0.4, to: 47.5, line: FACADE_N, facing: 'S', seed: 2 },
  // derrière l'auto-école et son parking
  { from: SIDE_STREET.x + 5, to: 47.5, line: LOT.zBack - 1.2, facing: 'S', seed: 3, scale: 1.08 },
  // rue transversale
  { from: -64, to: FACADE_N - 17, line: SIDE_STREET.x - 5, facing: 'E', seed: 4 },
  { from: -64, to: LOT.zBack - 19, line: SIDE_STREET.x + 5, facing: 'W', seed: 5 },
  // arrière-plans
  { from: 12, to: 110, line: -66, facing: 'S', seed: 8, scale: 1.15 },
  { from: -110, to: -56, line: -66, facing: 'S', seed: 13, scale: 1.15 },
  { from: -100, to: -R.x - 24, line: FACADE_N - 6, facing: 'S', seed: 9 },
  { from: R.x + 24, to: 100, line: FACADE_N - 6, facing: 'S', seed: 10 },
  { from: -100, to: -R.x - 24, line: FACADE_S + 6, facing: 'N', seed: 11 },
  { from: R.x + 24, to: 100, line: FACADE_S + 6, facing: 'N', seed: 12 },
]

function fill(row: Row, pool: ModelInfo[]): Placed[] {
  const out: Placed[] = []
  const len = row.to - row.from
  const sc = row.scale ?? 1
  let rnd = row.seed * 9301 + 49297
  const next = () => {
    rnd = (rnd * 233280 + 12345) % 2147483647
    return rnd / 2147483647
  }
  // hors rangées : l'église (point de fuite), la maison à jardin, et l'immeuble qui porte déjà une enseigne d'auto-école
  const usable = pool.filter((b) => !/eglise|le_mans|auto_ecole/.test(b.file))
  const order = [...usable].sort(() => next() - 0.5)
  if (row.first) {
    const i = order.findIndex((b) => b.file.includes(row.first!))
    if (i > 0) order.unshift(order.splice(i, 1)[0])
  }
  let cursor = 0
  let k = 0
  const picks: { b?: ModelInfo; w: number; d: number; h: number }[] = []
  while (cursor < len - 4) {
    const b = order.length ? order[k % order.length] : undefined
    const w = (b?.size?.[0] ?? 9 + next() * 5) * sc
    const d = (b?.size?.[2] ?? 11) * sc
    const h = (b?.size?.[1] ?? 12 + Math.floor(next() * 3) * 3) * sc
    if (cursor + w > len + 2.5 && picks.length) break
    picks.push({ b, w, d, h })
    cursor += w
    k++
  }
  // on étire légèrement en largeur pour que la rangée tombe juste
  const stretch = picks.length ? Math.min(1.18, Math.max(0.85, len / cursor)) : 1
  let at = row.from
  picks.forEach((p, i) => {
    const w = p.w * stretch
    const c = at + w / 2
    at += w
    const depthOff = p.d / 2
    const pos =
      row.facing === 'S' ? { x: c, z: row.line - depthOff, rot: 0 }
      : row.facing === 'N' ? { x: c, z: row.line + depthOff, rot: Math.PI }
      : row.facing === 'E' ? { x: row.line - depthOff, z: c, rot: Math.PI / 2 }
      : { x: row.line + depthOff, z: c, rot: -Math.PI / 2 }
    out.push({ key: `${row.seed}-${i}`, file: p.b?.file, ...pos, scale: [sc * stretch, sc, sc], size: [w, p.h, p.d] })
  })
  return out
}

/** La nuit, les façades restent lisibles : léger éclairage urbain simulé par l'émissif */
function tuneFacade(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const mat = m.material as THREE.MeshStandardMaterial
    if (!mat.map || mat.userData.facade) return
    mat.userData.facade = true
    mat.emissiveMap = mat.map
    mat.emissive = new THREE.Color('#ffd9a8')
    mat.emissiveIntensity = 0
    m.userData.glow = 0.05
    m.userData.glowDay = 0
    litWindows(mat)
  })
}

export function City() {
  const placed = useMemo(() => ROWS.flatMap((r) => fill(r, MODELS.buildings)), [])
  const monument = MODELS.buildings.find((b) => b.file.includes('eglise'))
  return (
    <group>
      {placed.map((p) =>
        p.file ? (
          <Model key={p.key} file={p.file} position={[p.x, SW, p.z]} rotation={p.rot} scale={p.scale} tune={tuneFacade} />
        ) : (
          <mesh key={p.key} position={[p.x, SW + p.size[1] / 2, p.z]} rotation={[0, p.rot, 0]} castShadow receiveShadow>
            <boxGeometry args={p.size} />
            <meshStandardMaterial color="#d9d2c4" roughness={0.9} />
          </mesh>
        ),
      )}
      {/* point de fuite au bout de la rue transversale */}
      {monument && <Model file={monument.file} position={[SIDE_STREET.x + 4, SW, -112]} rotation={0} />}
    </group>
  )
}
