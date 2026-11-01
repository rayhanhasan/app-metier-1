import { useMemo } from 'react'
import { STREETS } from '../lib/geometry'

const ROAD = '#d5dce6'
const SIDEWALK = '#f4f6fa'
const GROUND = '#e9eef5'
const LINE = '#ffffff'

function Slab({ pos, size, color, y = 0.02 }: { pos: [number, number]; size: [number, number]; color: string; y?: number }) {
  return (
    <mesh position={[pos[0], y, pos[1]]} receiveShadow>
      <boxGeometry args={[size[0], 0.04, size[1]]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}

function Dashes({ from, to, z, x, vertical = false }: { from: number; to: number; z?: number; x?: number; vertical?: boolean }) {
  const items = useMemo(() => {
    const out: number[] = []
    for (let v = from; v < to; v += 2.4) out.push(v)
    return out
  }, [from, to])
  return (
    <>
      {items.map((v) => (
        <mesh key={v} position={vertical ? [x!, 0.05, v] : [v, 0.05, z!]} receiveShadow>
          <boxGeometry args={vertical ? [0.12, 0.01, 1.1] : [1.1, 0.01, 0.12]} />
          <meshStandardMaterial color={LINE} />
        </mesh>
      ))}
    </>
  )
}

function Crosswalk({ x, z, vertical = false }: { x: number; z: number; vertical?: boolean }) {
  return (
    <group position={[x, 0.05, z]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={vertical ? [0, 0, -1.5 + i * 0.6] : [-1.5 + i * 0.6, 0, 0]}>
          <boxGeometry args={vertical ? [2.2, 0.01, 0.32] : [0.32, 0.01, 2.2]} />
          <meshStandardMaterial color={LINE} />
        </mesh>
      ))}
    </group>
  )
}

export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.9, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color="#a9c9f2" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1, 0.08, 0.35]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.9, 0.24, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  )
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.8, 6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#e0ecff" emissive="#bfdbfe" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function Ground() {
  const { middle, avenue, side } = STREETS
  return (
    <group>
      {/* sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={GROUND} roughness={1} />
      </mesh>

      {/* îlot (trottoirs) */}
      <Slab pos={[-2, -1]} size={[44, 34]} color={SIDEWALK} y={0.02} />

      {/* rue centrale */}
      <Slab pos={[-7.5, middle.z]} size={[49, middle.half * 2]} color={ROAD} y={0.03} />
      <Dashes from={-30} to={side.x - side.half} z={middle.z} />
      {/* avenue */}
      <Slab pos={[0, avenue.z]} size={[120, avenue.half * 2]} color={ROAD} y={0.03} />
      <Dashes from={-60} to={60} z={avenue.z} />
      <Slab pos={[0, avenue.z + avenue.half + 1.2]} size={[120, 2.4]} color={SIDEWALK} y={0.02} />
      {/* rue latérale */}
      <Slab pos={[side.x, -10]} size={[side.half * 2, 70]} color={ROAD} y={0.031} />
      <Dashes from={-45} to={avenue.z - avenue.half} x={side.x} vertical />

      <Crosswalk x={side.x - 4} z={avenue.z} />
      <Crosswalk x={-20} z={middle.z} />
      <Crosswalk x={side.x} z={middle.z - 4.5} vertical />

      {/* square entre les deux immeubles */}
      <Slab pos={[-3.6, -8.3]} size={[8.4, 5.4]} color="#e3ecdf" y={0.045} />
      <Tree position={[-6, 0.05, -9.6]} scale={1.1} />
      <Tree position={[-1.6, 0.05, -10]} scale={0.95} />
      <Tree position={[-4, 0.05, -7]} scale={1.2} />
      <Tree position={[-1.2, 0.05, -6.6]} scale={0.85} />
      <Bench position={[-6.2, 0.05, -6.6]} rotation={0.2} />

      {/* parking */}
      <Slab pos={[-0.3, 7.2]} size={[8.6, 5.2]} color="#dfe5ee" y={0.045} />
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[-4 + i * 1.85, 0.075, 7.2]}>
          <boxGeometry args={[0.07, 0.01, 4.6]} />
          <meshStandardMaterial color={LINE} />
        </mesh>
      ))}

      {/* arbres d'alignement */}
      {[-22, -16, -10, -4, 2, 8, 14].map((x) => (
        <Tree key={`a${x}`} position={[x + 1, 0.05, avenue.z + avenue.half + 1.1]} scale={0.9} />
      ))}
      {[-18, -6, 4, 14].map((x) => (
        <Tree key={`m${x}`} position={[x, 0.05, middle.z + middle.half + 0.7]} scale={0.75} />
      ))}
      {[-30, -24, -40, 26, 32, 40].map((x, i) => (
        <Tree key={`f${x}`} position={[x, 0.05, -16 + (i % 3) * 9]} scale={1.1 + (i % 2) * 0.3} />
      ))}
      {[-8, 0, 8].map((z) => (
        <Lamp key={z} position={[side.x - side.half - 0.5, 0.05, z - 10]} />
      ))}
      {[-14, 0, 12].map((x) => (
        <Lamp key={`l${x}`} position={[x, 0.05, avenue.z - avenue.half - 0.4]} />
      ))}
    </group>
  )
}
