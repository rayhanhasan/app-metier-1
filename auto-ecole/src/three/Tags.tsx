import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sim, syncUi } from '../store'

// Étiquettes HTML au-dessus des voitures de l'école : les éléments vivent dans le DOM
// (voir Hud.tsx) et sont repositionnés ici, à chaque image.
export const tagEls = new Map<string, HTMLElement>()

const v3 = new THREE.Vector3()
let acc = 0

export function Ticker() {
  useFrame(({ camera, size }, dt) => {
    sim.step(dt)
    acc += dt
    if (acc > 0.25) {
      acc = 0
      syncUi()
    }
    for (const v of sim.vehicles) {
      const el = tagEls.get(v.id)
      if (!el) continue
      v3.set(v.x, 2.15, v.z).project(camera)
      const hidden = v3.z > 1 || Math.abs(v3.x) > 1.05 || Math.abs(v3.y) > 1.05
      el.style.visibility = hidden ? 'hidden' : 'visible'
      if (!hidden) el.style.transform = `translate3d(${((v3.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-v3.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0) translate(-50%, -100%)`
    }
  }, -1)
  return null
}
