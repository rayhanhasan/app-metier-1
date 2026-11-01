import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { labelEls, labelPos } from '../lib/labels'

const v = new THREE.Vector3()

/** Projette chaque étiquette DOM sur l'écran, à chaque frame. */
export function Projector() {
  useFrame(({ camera, size }) => {
    for (const [id, el] of labelEls) {
      const p = labelPos.get(id)
      if (!p) continue
      v.set(p[0], p[1], p[2]).project(camera)
      if (v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) {
        el.style.visibility = 'hidden'
        continue
      }
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.visibility = 'visible'
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
    }
  })
  return null
}
