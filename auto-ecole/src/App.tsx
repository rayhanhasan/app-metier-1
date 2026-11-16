import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Ground } from './three/Ground'
import { School } from './three/School'
import { City } from './three/City'
import { Props } from './three/Props'
import { Vehicles } from './three/Vehicles'
import { People } from './three/People'
import { Effects, Lighting } from './three/Atmosphere'
import { CameraRig } from './three/CameraRig'
import { Ticker } from './three/Tags'
import { Hud } from './ui/Hud'

const q = new URLSearchParams(location.search)
const STILL = q.has('still')

/** Mode capture (?still) : fige l'image après quelques rendus et l'expose pour un script. */
function Capture() {
  const gl = useThree((s) => s.gl)
  const setFrameloop = useThree((s) => s.setFrameloop)
  const n = useRef(0)
  useFrame(() => {
    if (!STILL) return
    n.current++
    if (n.current === Number(q.get('frames') ?? 14)) {
      ;(window as unknown as { __png: string }).__png = gl.domElement.toDataURL('image/jpeg', 0.93)
      setFrameloop('never')
    }
  }, 2)
  return null
}

function Loading() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#0b1020] text-white">
      <div className="text-center">
        <div className="text-[15px] font-semibold">Auto-école du Parc</div>
        <div className="mt-1 text-[12px] text-white/60">Chargement du quartier…</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1020]">
      <Suspense fallback={<Loading />}>
        <Canvas
          shadows
          dpr={STILL ? 1 : [1, 1.75]}
          camera={{ position: [50, 21, 58], fov: 27, near: 0.5, far: 900 }}
          gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
        >
          <Lighting />
          <Ground />
          <School />
          <City />
          <Props />
          <Vehicles />
          <People />
          <Ticker />
          <CameraRig />
          <Effects />
          <Capture />
        </Canvas>
      </Suspense>
      {!q.has('nohud') && <Hud />}
    </div>
  )
}
