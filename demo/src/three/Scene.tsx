import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { useStore } from '../store'
import { BUILDINGS, buildingById } from '../data/portfolio'
import { buildingHeight, lotBox } from '../lib/geometry'
import { BuildingMesh } from './Building'
import { Ground } from './Ground'
import { Life } from './Life'
import { Projector } from './Projector'

const HOME = { pos: [27, 39, 51] as const, target: [-4.2, 0, 1.2] as const }

function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const focus = useStore((s) => s.focus)
  const kiosk = useStore((s) => s.kiosk)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    // Intro : on part de loin puis on plonge sur le quartier
    c.setLookAt(60, 70, 90, HOME.target[0], HOME.target[1], HOME.target[2], false)
    const t = setTimeout(() => c.setLookAt(...HOME.pos, ...HOME.target, true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c || focus.nonce === 0) return
    const lots = useStore.getState().lots
    if (focus.kind === 'home') {
      c.setFocalOffset(0, 0, 0, true)
      c.setLookAt(...HOME.pos, ...HOME.target, true)
    } else if (focus.kind === 'lot') {
      const lot = lots.find((l) => l.id === focus.id)
      if (!lot) return
      const { center } = lotBox(lot, buildingById[lot.buildingId])
      const [x, y, z] = center
      c.setFocalOffset(2.2, 0, 0, true)
      c.setLookAt(x + 14, y + 12, z + 27, x, y, z + 1, true)
    } else {
      const b = buildingById[focus.id]
      const [x, z] = b.position
      const y = buildingHeight(b) / 2
      c.setFocalOffset(0, 0, 0, true)
      c.setLookAt(x + 15, y + 14, z + 28, x, y, z, true)
    }
  }, [focus])

  useFrame((_, dt) => {
    if (kiosk && ref.current) ref.current.rotate(dt * 0.05, 0, false)
  })

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={10}
      maxDistance={95}
      minPolarAngle={0.25}
      maxPolarAngle={1.2}
      smoothTime={0.6}
      draggingSmoothTime={0.12}
    />
  )
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#eaf0f7']} />
      <fog attach="fog" args={['#eaf0f7', 70, 170]} />
      <hemisphereLight args={['#ffffff', '#c7d2e2', 1.1]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[22, 38, 18]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-20, 15, -10]} intensity={0.35} />

      <Ground />
      {BUILDINGS.map((b, i) => (
        <BuildingMesh key={b.id} b={b} index={i} />
      ))}
      <Life />
      <Projector />
      <CameraRig />
    </>
  )
}
