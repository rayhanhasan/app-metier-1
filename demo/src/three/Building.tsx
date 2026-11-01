import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Building, BuildingStyle, Lot } from '../data/types'
import { useStore } from '../store'
import { ACCENT, lotColor, lotPulse } from '../lib/colors'
import { buildingHeight, buildingWidth, floorY, lotBox } from '../lib/geometry'
import { textTexture } from './textTexture'

const BASE_TINT: Record<BuildingStyle, string> = {
  haussmann: '#fbf7f0',
  modern: '#ffffff',
  loft: '#f6ece6',
  house: '#fbf6ee',
}
const FRAME: Record<BuildingStyle, string> = {
  haussmann: '#ece3d3',
  modern: '#e7ecf3',
  loft: '#d8b7a6',
  house: '#ebe1d1',
}
const DIM = new THREE.Color('#e5e9f0')

const glassMat = new THREE.MeshStandardMaterial({ color: '#2b4a78', roughness: 0.25, metalness: 0.35 })
const doorMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 })
const railMat = new THREE.MeshStandardMaterial({ color: '#bfdbfe', transparent: true, opacity: 0.45, roughness: 0.1 })
const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 })

const damp = (dt: number, k = 7) => 1 - Math.exp(-dt * k)

function Windows({ lot, b, size }: { lot: Lot; b: Building; size: [number, number, number] }) {
  const [w, h, d] = size
  const items = useMemo(() => {
    const out: { x: number; y: number; z: number; ry: number; ww: number; wh: number }[] = []
    if (lot.typology === 'Commerce') {
      out.push({ x: 0, y: -h * 0.12, z: d / 2 + 0.012, ry: 0, ww: w * 0.86, wh: h * 0.55 })
      return out
    }
    const perRow = b.style === 'house' ? 2 : b.style === 'loft' ? 2 : Math.max(1, Math.round(w / 1.05))
    const rowH = h / lot.spanFloors
    for (let r = 0; r < lot.spanFloors; r++) {
      for (let i = 0; i < perRow; i++) {
        const x = -w / 2 + (w / perRow) * (i + 0.5)
        if (b.style === 'house' && r === 0 && i === 0) continue // porte
        const ww = b.style === 'loft' ? 0.95 : b.style === 'house' ? 0.55 : 0.46
        const wh = rowH * (b.style === 'loft' ? 0.62 : 0.52)
        const y = -h / 2 + rowH * (r + 0.55)
        out.push({ x, y, z: d / 2 + 0.012, ry: 0, ww, wh })
        out.push({ x, y, z: -d / 2 - 0.012, ry: Math.PI, ww, wh })
      }
    }
    return out
  }, [lot.typology, lot.spanFloors, b.style, w, h, d])

  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, it.z]} rotation={[0, it.ry, 0]} material={glassMat}>
          <planeGeometry args={[it.ww, it.wh]} />
        </mesh>
      ))}
      {b.style === 'house' && (
        <mesh position={[-w / 4, -h / 2 + 0.48, d / 2 + 0.03]} material={doorMat}>
          <boxGeometry args={[0.55, 0.95, 0.05]} />
        </mesh>
      )}
      {b.style === 'modern' && lot.floor > 0 && (
        <group position={[0, -h / 2 + 0.04, d / 2 + 0.3]}>
          <mesh material={whiteMat} castShadow>
            <boxGeometry args={[w - 0.35, 0.06, 0.6]} />
          </mesh>
          <mesh position={[0, 0.2, 0.29]} material={railMat}>
            <boxGeometry args={[w - 0.35, 0.36, 0.02]} />
          </mesh>
        </group>
      )}
      {lot.typology === 'Commerce' && <Shopfront w={w} h={h} d={d} />}
    </>
  )
}

function Shopfront({ w, h, d }: { w: number; h: number; d: number }) {
  const tex = useMemo(() => textTexture('BOULANGERIE MARTIN', { color: '#ffffff', bg: ACCENT, height: 120, width: 1024 }), [])
  return (
    <group position={[0, h / 2, d / 2]}>
      <mesh position={[0, -0.32, 0.4]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[w * 0.9, 0.05, 0.85]} />
        <meshStandardMaterial color={ACCENT} />
      </mesh>
      <mesh position={[0, -0.12, 0.03]}>
        <planeGeometry args={[w * 0.7, 0.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function LotMesh({ lot, b, delay }: { lot: Lot; b: Building; delay: number }) {
  const mode = useStore((s) => s.mode)
  const year = useStore((s) => s.year)
  const selected = useStore((s) => s.selectedId === lot.id)
  const hovered = useStore((s) => s.hoveredId === lot.id)
  const dimmed = useStore((s) => !!s.highlight && !s.highlight.ids.includes(lot.id))
  const lit = useStore((s) => !!s.highlight && s.highlight.ids.includes(lot.id))
  const hover = useStore((s) => s.hover)
  const select = useStore((s) => s.select)
  const clock = useThree((s) => s.clock)

  const { center, size } = lotBox(lot, b)
  const target = useMemo(() => new THREE.Color(mode === 'global' ? BASE_TINT[b.style] : lotColor(lot, mode)), [mode, lot, b.style])
  const pulse = lotPulse(lot, mode, year) || lit

  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const changeAt = useRef(0)

  useEffect(() => {
    changeAt.current = clock.elapsedTime + delay
  }, [target, clock, delay])

  useFrame(({ clock }, dt) => {
    const m = mat.current
    const g = group.current
    if (!m || !g) return
    const t = clock.elapsedTime
    if (t >= changeAt.current) m.color.lerp(dimmed ? DIM : target, damp(dt, 6))
    m.opacity = THREE.MathUtils.lerp(m.opacity, dimmed ? 0.35 : 1, damp(dt))
    const e = selected ? 0.32 : pulse ? 0.16 + 0.16 * Math.sin(t * 4.2) : hovered ? 0.14 : 0
    m.emissive.copy(selected && mode === 'global' ? new THREE.Color(ACCENT) : m.color)
    m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, e, damp(dt, 10))
    g.position.z = THREE.MathUtils.lerp(g.position.z, center[2] + (selected ? 1.1 : hovered ? 0.18 : 0), damp(dt, 6))
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hover(lot.id)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    hover(null)
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(lot.id)
  }

  return (
    <group ref={group} position={[center[0], center[1], center[2]]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size[0] - 0.06, size[1] - 0.07, size[2] - 0.04]} />
        <meshStandardMaterial ref={mat} color={BASE_TINT[b.style]} roughness={0.75} transparent />
      </mesh>
      <group visible={!dimmed}>
        <Windows lot={lot} b={b} size={size} />
      </group>
    </group>
  )
}

function Prism({ points, length, color, position, rotation }: { points: [number, number][]; length: number; color: string; position: [number, number, number]; rotation?: [number, number, number] }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
    const g = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false })
    g.translate(0, 0, -length / 2)
    return g
  }, [points, length])
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

function Roof({ b }: { b: Building }) {
  const W = buildingWidth(b)
  const D = b.depth
  const H = buildingHeight(b)
  const [x, z] = b.position

  if (b.style === 'haussmann') {
    return (
      <group position={[x, H, z]}>
        {/* toit mansardé en zinc */}
        <group position={[0, 0.55, 0]} scale={[W + 0.1, 1, D + 0.1]}>
          <mesh rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.6, Math.SQRT1_2, 1.0, 4, 1]} />
            <meshStandardMaterial color="#9aa7b8" roughness={0.6} flatShading />
          </mesh>
        </group>
        {[-W / 3, 0, W / 3].map((dx) => (
          <mesh key={dx} position={[dx, 0.5, D * 0.45]} castShadow>
            <boxGeometry args={[0.6, 0.55, 0.5]} />
            <meshStandardMaterial color="#f1ece3" />
          </mesh>
        ))}
        {[-W / 2.6, W / 2.6].map((dx) => (
          <mesh key={dx} position={[dx, 1.1, -D * 0.2]} castShadow>
            <boxGeometry args={[0.35, 0.7, 0.35]} />
            <meshStandardMaterial color="#d6c6b5" />
          </mesh>
        ))}
      </group>
    )
  }
  if (b.style === 'modern') {
    return (
      <group position={[x, H, z]}>
        {[-W / 4, W / 4].map((dx) => (
          <mesh key={dx} position={[dx, 0.32, -D * 0.12]} rotation={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[W * 0.38, 0.04, D * 0.5]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
        <mesh position={[W * 0.36, 0.3, D * 0.3]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.7]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
    )
  }
  if (b.style === 'loft') {
    const teeth = 3
    const td = D / teeth
    return (
      <group position={[x, H, z]}>
        {Array.from({ length: teeth }, (_, i) => (
          <Prism
            key={i}
            points={[
              [-D / 2 + i * td, 0],
              [-D / 2 + (i + 1) * td, 0],
              [-D / 2 + (i + 1) * td, 0.6],
            ]}
            length={W}
            color={i % 2 ? '#cfa995' : '#d4b2a0'}
            position={[0, 0.06, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}
      </group>
    )
  }
  // maison : toit à deux pans
  return (
    <group position={[x, H, z]}>
      <Prism
        points={[
          [-D / 2 - 0.2, 0],
          [D / 2 + 0.2, 0],
          [0, 1.25],
        ]}
        length={W + 0.3}
        color="#c9826b"
        position={[0, 0.04, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <mesh position={[W * 0.25, 1.1, -0.6]} castShadow>
        <boxGeometry args={[0.3, 0.7, 0.3]} />
        <meshStandardMaterial color="#e2d5c3" />
      </mesh>
    </group>
  )
}

function Frame({ b }: { b: Building }) {
  const W = buildingWidth(b)
  const D = b.depth
  const H = buildingHeight(b)
  const [x, z] = b.position
  const color = FRAME[b.style]
  const slabs = useMemo(() => {
    const ys: number[] = []
    if (b.style !== 'house') for (let f = 1; f < b.floors; f++) ys.push(floorY(b, f))
    return ys
  }, [b])
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[W + 0.3, 0.12, D + 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {slabs.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.14, 0.07, D + 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.26, 0.1, D + 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + 0.04), H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, H, D + 0.06]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

/** Limite de parcelle façon cadastre (liseré bleu au sol) */
function Plot({ b }: { b: Building }) {
  const W = buildingWidth(b) + 1.2
  const D = b.depth + 1.2
  const [x, z] = b.position
  const t = 0.07
  const color = '#93b4f5'
  return (
    <group position={[x, 0.06, z]}>
      {[
        [0, -D / 2, W, t],
        [0, D / 2, W, t],
        [-W / 2, 0, t, D],
        [W / 2, 0, t, D],
      ].map(([px, pz, sx, sz], i) => (
        <mesh key={i} position={[px, 0, pz]}>
          <boxGeometry args={[sx, 0.012, sz]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

export function BuildingMesh({ b, index }: { b: Building; index: number }) {
  const allLots = useStore((s) => s.lots)
  const lots = useMemo(() => allLots.filter((l) => l.buildingId === b.id), [allLots, b.id])
  const root = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)

  // Intro : les bâtiments « poussent » du sol
  useFrame(({ clock }) => {
    const g = root.current
    if (!g) return
    if (start.current === null) start.current = clock.elapsedTime + 0.25 + index * 0.18
    const p = THREE.MathUtils.clamp((clock.elapsedTime - start.current) / 0.9, 0, 1)
    const eased = p === 1 ? 1 : 1 - Math.pow(1 - p, 3) * Math.cos(p * Math.PI * 0.5)
    g.scale.y = Math.max(0.001, eased)
  })

  return (
    <group>
      <Plot b={b} />
      <group ref={root}>
        <Frame b={b} />
        {lots.map((l) => (
          <LotMesh key={l.id} lot={l} b={b} delay={index * 0.06 + l.floor * 0.07 + l.col * 0.035} />
        ))}
        <Roof b={b} />
      </group>
    </group>
  )
}
