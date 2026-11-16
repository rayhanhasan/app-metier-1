import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { MODELS, modelUrl } from '../assets'
import { sim } from '../store'
import type { Walker } from '../sim/sim'
import { INTERIOR_CAST, type CastSpot } from './School'
import { OUTDOOR_CAST } from './Props'

function findClip(clips: THREE.AnimationClip[], key: string) {
  const k = key.toLowerCase()
  return clips.find((c) => c.name.toLowerCase() === k) ?? clips.find((c) => c.name.toLowerCase().includes(k))
}

export function useActor(file: string) {
  const gltf = useGLTF(modelUrl(file))
  return useMemo(() => {
    const root = cloneSkinned(gltf.scene)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
        m.frustumCulled = false // les maillages animés sortent de leur boîte englobante d'origine
      }
    })
    const mixer = new THREE.AnimationMixer(root)
    const get = (name: string) => {
      const clip = findClip(gltf.animations, name)
      return clip ? mixer.clipAction(clip) : null
    }
    return { root, mixer, get }
  }, [gltf])
}

function WalkerActor({ w, file }: { w: Walker; file: string }) {
  const { root, mixer, get } = useActor(file)
  const group = useRef<THREE.Group>(null)
  const state = useRef<'walk' | 'idle' | ''>('')
  const actions = useMemo(() => ({ walk: get('walk'), idle: get('idle') }), [get])

  useEffect(() => {
    mixer.setTime(Math.random() * 2)
  }, [mixer])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.position.set(w.x, 0.14, w.z)
    // lissage du cap pour éviter les demi-tours secs aux angles
    let d = w.heading - g.rotation.y
    while (d > Math.PI) d -= 2 * Math.PI
    while (d < -Math.PI) d += 2 * Math.PI
    g.rotation.y += d * Math.min(1, dt * 6)
    const next = w.v > 0.25 ? 'walk' : 'idle'
    if (next !== state.current) {
      const from = state.current ? actions[state.current] : null
      const to = actions[next] ?? actions.walk ?? actions.idle
      if (to) {
        to.reset().fadeIn(0.25).play()
        if (from && from !== to) from.fadeOut(0.25)
      }
      state.current = next
    }
    if (actions.walk) actions.walk.timeScale = Math.max(0.5, w.v / 1.3)
    mixer.update(dt)
  })

  return (
    <group ref={group}>
      <primitive object={root} />
    </group>
  )
}

/** Assis, l'origine du personnage reste aux pieds : le bassin est environ 0,25 m en arrière. */
const SIT_BACK = 0.25

function StaticActor({ spot, file }: { spot: CastSpot; file: string }) {
  const { root, mixer, get } = useActor(file)
  useEffect(() => {
    const a = get(spot.anim) ?? (spot.anim === 'talk' ? get('idle') : null) ?? get('idle')
    if (a) {
      a.reset().play()
      mixer.setTime(Math.random() * 3)
    }
  }, [get, mixer, spot.anim])
  useFrame((_, dt) => mixer.update(dt * (spot.anim === 'sit' ? 0.6 : 1)))
  const off = spot.anim === 'sit' ? SIT_BACK : 0
  return <primitive object={root} position={[spot.x + Math.sin(spot.heading) * off, spot.y, spot.z + Math.cos(spot.heading) * off]} rotation={[0, spot.heading, 0]} />
}

/** Conducteur ou passager, placé dans le repère de la voiture */
export function Occupant({ file, side, anim }: { file: string; side: 1 | -1; anim: 'drive' | 'sit' }) {
  const { root, mixer, get } = useActor(file)
  useEffect(() => {
    const a = get(anim) ?? get('sit')
    a?.reset().play()
    mixer.setTime(Math.random() * 2)
    root.traverse((o) => {
      o.castShadow = false
    })
  }, [get, mixer, anim, root])
  useFrame((_, dt) => mixer.update(dt * 0.7))
  return <primitive object={root} position={[side * 0.37, 0.0, 0.12]} scale={0.92} />
}

export function People() {
  const files = MODELS.people.map((p) => p.file)
  if (!files.length) return null
  const cast = [...INTERIOR_CAST, ...OUTDOOR_CAST]
  return (
    <group>
      {sim.walkers.map((w) => (
        <WalkerActor key={w.id} w={w} file={files[w.model % files.length]} />
      ))}
      {cast.map((spot, i) => (
        <StaticActor key={i} spot={spot} file={files[(i * 3 + 1) % files.length]} />
      ))}
    </group>
  )
}
