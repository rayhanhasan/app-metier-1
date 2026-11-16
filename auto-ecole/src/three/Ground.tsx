import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CROSSING, FACADE_N, FACADE_S, LANE, LOT, PARK, ROAD_HALF, ROUNDABOUT, SIDE_STREET, BRAND } from '../world'
import { arcPoints, disc, polygon, quads, rect, wallAlong, worldBox, type V2 } from './flat'
import { canvasTexture, FONT, usePbr } from './materials'
import { useUi } from '../store'
import { PRESETS } from './daylight'

const CURB_H = 0.14
const R = ROUNDABOUT

/** Demi-angle (degrés) occupé par le boulevard sur le cercle extérieur d'un giratoire */
const ARM = (Math.asin(ROAD_HALF / R.outerR) * 180) / Math.PI

function useGeometries() {
  return useMemo(() => {
    // ── Chaussées (y = 0) ──
    const roads = [
      rect(-160, 160, -ROAD_HALF, ROAD_HALF, 0.0),
      disc(-R.x, 0, R.outerR, 0.001),
      disc(R.x, 0, R.outerR, 0.001),
      rect(SIDE_STREET.x - SIDE_STREET.half, SIDE_STREET.x + SIDE_STREET.half, -110, -ROAD_HALF, 0.002),
    ]
    const lot = [
      rect(LOT.x0, LOT.x1, LOT.zBack, LOT.zFront, 0.003),
      rect(LOT.entryX - 2.7, LOT.entryX + 2.7, LOT.zFront, -ROAD_HALF, 0.003),
      rect(LOT.exitX - 2.7, LOT.exitX + 2.7, LOT.zFront, -ROAD_HALF, 0.003),
    ]

    // ── Trottoirs (surélevés) ──
    const sw: THREE.BufferGeometry[] = []
    const edges: V2[][] = []
    const strip = (x0: number, x1: number, z0: number, z1: number) => sw.push(rect(x0, x1, z0, z1, CURB_H))
    const xin = R.x - R.outerR + 0.4 // jonction avec le parvis des giratoires
    // nord : interrompu par la rue transversale et les deux accès du parking
    const northCuts: [number, number][] = [
      [SIDE_STREET.x - SIDE_STREET.half, SIDE_STREET.x + SIDE_STREET.half],
      [LOT.exitX - 2.7, LOT.exitX + 2.7],
      [LOT.entryX - 2.7, LOT.entryX + 2.7],
    ]
    let x = -xin
    for (const [a, b] of [...northCuts, [xin, xin] as [number, number]]) {
      strip(x, a, FACADE_N, -ROAD_HALF)
      edges.push([
        [x, -ROAD_HALF],
        [a, -ROAD_HALF],
      ])
      x = b
    }
    // îlots bâtis au nord (sol sous les immeubles), hors parking de l'auto-école
    const far = FACADE_N - 110
    strip(-xin, SIDE_STREET.x - SIDE_STREET.half, far, FACADE_N)
    strip(SIDE_STREET.x + SIDE_STREET.half, LOT.x0, far, FACADE_N)
    strip(LOT.x0, LOT.x1, far, LOT.zBack)
    strip(LOT.x1, xin, far, FACADE_N)
    edges.push([[SIDE_STREET.x - SIDE_STREET.half, -ROAD_HALF], [SIDE_STREET.x - SIDE_STREET.half, far]])
    edges.push([[SIDE_STREET.x + SIDE_STREET.half, far], [SIDE_STREET.x + SIDE_STREET.half, -ROAD_HALF]])
    edges.push([[LOT.exitX - 2.7, -ROAD_HALF], [LOT.exitX - 2.7, FACADE_N]])
    edges.push([[LOT.exitX + 2.7, FACADE_N], [LOT.exitX + 2.7, -ROAD_HALF]])
    edges.push([[LOT.entryX - 2.7, -ROAD_HALF], [LOT.entryX - 2.7, FACADE_N]])
    edges.push([[LOT.entryX + 2.7, FACADE_N], [LOT.entryX + 2.7, -ROAD_HALF]])
    strip(-xin, xin, ROAD_HALF, FACADE_S + 0.01)
    edges.push([
      [-xin, ROAD_HALF],
      [xin, ROAD_HALF],
    ])
    strip(-xin, PARK.x0, FACADE_S, PARK.z1 + 30)
    strip(PARK.x1, xin, FACADE_S, PARK.z1 + 30)
    strip(PARK.x0, PARK.x1, PARK.z1, PARK.z1 + 30)

    // parvis des giratoires : deux « C » par giratoire
    for (const cx of [-R.x, R.x]) {
      const W = 60
      const D = 70
      for (const sgn of [1, -1]) {
        const arc = arcPoints(cx, 0, R.outerR, sgn > 0 ? ARM : -ARM, sgn > 0 ? 180 - ARM : -(180 - ARM), 3)
        const zEdge = -sgn * ROAD_HALF
        const zFar = -sgn * D
        const poly: V2[] = [...arc, [cx - W, zEdge], [cx - W, zFar], [cx + W, zFar], [cx + W, zEdge]]
        // on retire la partie déjà couverte côté quartier pour éviter le recouvrement
        sw.push(polygon(clipX(poly, cx < 0 ? -Infinity : xin, cx < 0 ? -xin : Infinity), CURB_H - 0.001))
        edges.push(arc)
      }
      // bordures droites le long des bras extérieurs
      const out = cx < 0 ? -1 : 1
      for (const z of [-ROAD_HALF, ROAD_HALF]) edges.push([
        [cx + out * R.outerR * Math.cos((ARM * Math.PI) / 180), z],
        [cx + out * 100, z],
      ])
    }

    // ── Square ──
    const grass = [rect(PARK.x0 + 1.2, PARK.x1 - 1.2, PARK.z0 + 1.6, PARK.z1 - 1.2, CURB_H + 0.02)]
    const islands = [disc(-R.x, 0, R.islandR, 0.2), disc(R.x, 0, R.islandR, 0.2)]

    return { roads, lot, sw, edges, grass, islands }
  }, [])
}

/** Découpe grossière d'un polygone convexe-ish par une bande verticale [xMin, xMax] */
function clipX(poly: V2[], xMin: number, xMax: number): V2[] {
  return poly.map(([x, z]) => [Math.max(xMin, Math.min(xMax, x)), z] as V2)
}

function Markings() {
  const geo = useMemo(() => {
    const q: { x: number; z: number; w: number; d: number; rot?: number }[] = []
    const xin = R.x - R.outerR - 1
    // axe central en pointillés (3 m plein, 3,5 m vide), interrompu au passage piéton
    for (let x = -xin; x < xin; x += 6.5) {
      if (Math.abs(x + 1.5 - CROSSING.x) < CROSSING.half + 3) continue
      q.push({ x: x + 1.5, z: 0, w: 3, d: 0.12 })
    }
    for (const out of [-1, 1]) for (let x = R.x + R.outerR + 1; x < 150; x += 6.5) q.push({ x: out * (x + 1.5), z: 0, w: 3, d: 0.12 })
    // passage piéton
    for (let z = -ROAD_HALF + 0.45; z < ROAD_HALF; z += 1.0) q.push({ x: CROSSING.x, z, w: CROSSING.half * 2, d: 0.5 })
    // lignes d'arrêt
    q.push({ x: CROSSING.stopNorthLane + 0.5, z: -LANE, w: 0.5, d: 3.1 })
    q.push({ x: CROSSING.stopSouthLane - 0.5, z: LANE, w: 0.5, d: 3.1 })
    // giratoires : « cédez le passage » en pointillés sur chaque entrée
    for (const cx of [-R.x, R.x]) {
      for (const side of [-1, 1]) {
        const base = side > 0 ? 0 : 180
        for (let a = -ARM + 2; a < ARM; a += 5) {
          const rad = ((base + a) * Math.PI) / 180
          q.push({ x: cx + Math.cos(rad) * (R.outerR - 0.3), z: -Math.sin(rad) * (R.outerR - 0.3), w: 0.5, d: 0.5, rot: rad })
        }
      }
    }
    // parking : places en bataille
    const edge = LOT.spotW / 2
    for (const sx of LOT.spotsX) q.push({ x: sx - edge, z: LOT.spotZ - 0.2, w: 0.1, d: LOT.spotDepth })
    q.push({ x: LOT.spotsX[LOT.spotsX.length - 1] + edge, z: LOT.spotZ - 0.2, w: 0.1, d: LOT.spotDepth })
    // rue transversale : axe
    for (let z = -12; z > -100; z -= 6.5) q.push({ x: SIDE_STREET.x, z, w: 0.12, d: 3 })
    return quads(q, 0.012)
  }, [])

  // anneau blanc autour de l'îlot central
  const rings = useMemo(() => {
    const g: THREE.BufferGeometry[] = []
    for (const cx of [-R.x, R.x]) {
      const ring = new THREE.RingGeometry(R.islandR + 0.35, R.islandR + 0.5, 72)
      ring.rotateX(-Math.PI / 2)
      ring.translate(cx, 0.013, 0)
      g.push(ring)
    }
    return g
  }, [])

  // inscription au sol sur les places de l'école
  const stencil = canvasTexture('stencil-ae', 512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.fillStyle = '#ffffff'
    g.font = `800 92px ${FONT}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('AUTO', w / 2, 72)
    g.fillText('ÉCOLE', w / 2, 180)
  })

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), [])
  const stencilMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: stencil, transparent: true, opacity: 0.85, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false }),
    [stencil],
  )

  return (
    <group>
      <mesh geometry={geo} material={mat} receiveShadow />
      {rings.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} receiveShadow />
      ))}
      {LOT.spotsX.slice(0, LOT.schoolSpots).map((sx) => (
        <mesh key={sx} position={[sx, 0.014, LOT.spotZ + 1.2]} rotation={[-Math.PI / 2, 0, 0]} material={stencilMat} receiveShadow>
          <planeGeometry args={[1.9, 0.95]} />
        </mesh>
      ))}
    </group>
  )
}

function Curbs({ edges }: { edges: V2[][] }) {
  const geos = useMemo(() => edges.map((e) => wallAlong(e, 0, CURB_H + 0.005)), [edges])
  const islands = useMemo(
    () => [-R.x, R.x].map((cx) => wallAlong(arcPoints(cx, 0, R.islandR, 0, 360, 5), 0, 0.2)),
    [],
  )
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b7b3aa', roughness: 0.85, side: THREE.DoubleSide }), [])
  return (
    <group>
      {[...geos, ...islands].map((g, i) => (
        <mesh key={i} geometry={g} material={mat} receiveShadow castShadow />
      ))}
    </group>
  )
}

function Park() {
  const gravel = usePbr('concrete_floor_02', 3, { color: '#d9cfbb', roughness: 1 })
  const hedge = usePbr('leafy_grass', 1.1, { color: '#4f7a3c', roughness: 1 })
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9c4b8', roughness: 0.8 }), [])
  const water = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3d6f86', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, envMapIntensity: 1.6 }), [])
  const paths = useMemo(() => {
    const cz = (PARK.z0 + PARK.z1) / 2 + 2
    const g: THREE.BufferGeometry[] = [
      rect(PARK.x0 + 1.2, PARK.x1 - 1.2, cz - 1.3, cz + 1.3, CURB_H + 0.03),
      rect(-1.3, 1.3, PARK.z0 + 1.6, PARK.z1 - 1.2, CURB_H + 0.031),
      disc(0, cz, 6.2, CURB_H + 0.032),
    ]
    return { g, cz }
  }, [])
  const hedges: [number, number, number, number][] = [
    // x, z, largeur, profondeur
    [PARK.x0 + 9, PARK.z0 + 2.6, 13, 0.9],
    [PARK.x1 - 9, PARK.z0 + 2.6, 13, 0.9],
    [-9, PARK.z0 + 2.6, 13, 0.9],
    [9, PARK.z0 + 2.6, 13, 0.9],
  ]
  return (
    <group>
      {paths.g.map((g, i) => (
        <mesh key={i} geometry={g} material={gravel} receiveShadow />
      ))}
      {hedges.map(([hx, hz, w, d], i) => (
        <mesh key={i} position={[hx, CURB_H + 0.45, hz]} material={hedge} geometry={worldBox(w, 0.9, d)} castShadow receiveShadow />
      ))}
      {/* fontaine */}
      <group position={[0, CURB_H, paths.cz]}>
        <mesh material={stone} castShadow receiveShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[3.1, 3.3, 0.6, 48, 1, true]} />
        </mesh>
        <mesh material={stone} position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[2.75, 3.1, 48]} />
        </mesh>
        <mesh material={water} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.78, 48]} />
        </mesh>
        <mesh material={stone} castShadow position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.28, 0.42, 1.8, 16]} />
        </mesh>
        <mesh material={stone} castShadow position={[0, 1.85, 0]}>
          <cylinderGeometry args={[1.0, 0.3, 0.22, 24]} />
        </mesh>
      </group>
    </group>
  )
}

function LotDetails() {
  const wall = usePbr('white_plaster_02', 2.5, { color: '#d8d2c6' })
  const hedge = usePbr('leafy_grass', 1.1, { color: '#4f7a3c', roughness: 1 })
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8d8a84', roughness: 0.7 }), [])
  const totemTex = canvasTexture('totem', 256, 768, (g, w, h) => {
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, h)
    g.fillStyle = BRAND.accent
    g.fillRect(0, 0, w, 26)
    g.fillStyle = '#fff'
    g.textAlign = 'center'
    g.font = `800 62px ${FONT}`
    g.fillText('AUTO', w / 2, 130)
    g.fillText('ÉCOLE', w / 2, 200)
    g.font = `600 38px ${FONT}`
    g.fillText('DU PARC', w / 2, 262)
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(w / 2, 420, 74, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = BRAND.color
    g.font = `800 96px ${FONT}`
    g.fillText('P', w / 2, 454)
    g.fillStyle = '#fff'
    g.font = `600 30px ${FONT}`
    g.fillText('Permis B · AAC', w / 2, 590)
    g.fillText('Boîte auto', w / 2, 634)
    g.fillText('04 78 00 00 00', w / 2, 712)
  })
  const zHedge = (LOT.zFront + (LOT.aisleZ + 3)) / 2
  return (
    <group>
      {/* mur de fond et mur est */}
      <mesh geometry={useMemo(() => wallAlong([[LOT.x0, LOT.zBack], [LOT.x1, LOT.zBack], [LOT.x1, LOT.zFront - 0.3]], 0, 1.9), [])} material={wall} castShadow receiveShadow />
      <mesh position={[(LOT.x0 + LOT.x1) / 2, 1.93, LOT.zBack]} material={cap} castShadow>
        <boxGeometry args={[LOT.x1 - LOT.x0 + 0.3, 0.08, 0.34]} />
      </mesh>
      {/* haie entre le trottoir et l'allée, entre la sortie et l'entrée */}
      <mesh position={[(LOT.exitX + LOT.entryX) / 2, 0.55, zHedge + 0.6]} material={hedge} geometry={worldBox(LOT.entryX - LOT.exitX - 6.4, 0.95, 1.0)} castShadow receiveShadow />
      {/* totem */}
      <group position={[LOT.exitX + 3.6, 0, LOT.zFront - 0.75]}>
        <mesh position={[0, 2.1, 0]} castShadow>
          <boxGeometry args={[1.25, 4.2, 0.22]} />
          <meshStandardMaterial color="#0a2f8a" roughness={0.5} />
        </mesh>
        {[0.112, -0.112].map((z, i) => (
          <mesh key={i} position={[0, 2.25, z]} rotation={[0, i ? Math.PI : 0, 0]} userData={{ glow: 1.2 }}>
            <planeGeometry args={[1.15, 3.45]} />
            <meshStandardMaterial map={totemTex} emissiveMap={totemTex} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export const GROUND_H = CURB_H

export function Ground() {
  const { roads, lot, sw, edges, grass, islands } = useGeometries()
  const asphalt = usePbr('asphalt_02', 2.6, { color: '#9a9ca2' })
  const lotAsphalt = usePbr('asphalt_02', 2.2, { color: '#b4b6ba' })
  const pavers = usePbr('large_grey_tiles', 2.4, { color: '#b9b4aa' })
  const lawn = usePbr('leafy_grass', 3.5, { color: '#86a56c' })
  const base = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9b5ad', roughness: 1 }), [])
  // la nuit, la chaussée est humide : elle accroche les lampadaires et les phares
  const tod = useUi((s) => s.tod)
  useEffect(() => {
    const wet = PRESETS[tod].night > 0.9
    for (const m of [asphalt, lotAsphalt]) {
      m.roughness = wet ? 0.42 : 1
      m.metalness = wet ? 0.15 : 0
      m.envMapIntensity = wet ? 2.2 : 1
    }
  }, [tod, asphalt, lotAsphalt])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={base} receiveShadow>
        <planeGeometry args={[900, 900]} />
      </mesh>
      {roads.map((g, i) => (
        <mesh key={`r${i}`} geometry={g} material={asphalt} receiveShadow />
      ))}
      {lot.map((g, i) => (
        <mesh key={`l${i}`} geometry={g} material={lotAsphalt} receiveShadow />
      ))}
      {sw.map((g, i) => (
        <mesh key={`s${i}`} geometry={g} material={pavers} receiveShadow />
      ))}
      {grass.map((g, i) => (
        <mesh key={`g${i}`} geometry={g} material={lawn} receiveShadow />
      ))}
      {islands.map((g, i) => (
        <mesh key={`i${i}`} geometry={g} material={lawn} receiveShadow />
      ))}
      <Curbs edges={edges} />
      <Markings />
      <Park />
      <LotDetails />
    </group>
  )
}

