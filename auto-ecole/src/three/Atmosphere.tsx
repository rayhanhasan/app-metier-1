import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, N8AO, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useUi } from '../store'
import { PRESETS } from './daylight'

const q = new URLSearchParams(location.search)
const LOW = q.get('q') === 'low'
const NO_FX = q.has('nofx')

/** Soleil, ciel HDRI, brouillard, et mise à jour des matériaux lumineux selon l'heure. */
export function Lighting() {
  const tod = useUi((s) => s.tod)
  const p = PRESETS[tod]
  const scene = useThree((s) => s.scene)
  const sun = useRef<THREE.DirectionalLight>(null)

  useEffect(() => {
    scene.fog = new THREE.Fog(p.fog, p.fogNear, p.fogFar)
    scene.environmentIntensity = p.envIntensity
    scene.backgroundIntensity = p.bgIntensity
    scene.backgroundBlurriness = p.bgBlur
  }, [scene, p])

  // Les objets marqués userData.glow s'allument à la tombée de la nuit (enseignes, écrans, dalles)
  useEffect(() => {
    const apply = () =>
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh || m.userData.glow === undefined) return
        const mat = m.material as THREE.MeshStandardMaterial
        if (!mat.emissive) return
        if (m.userData.glowDay === undefined) m.userData.glowDay = mat.emissiveIntensity
        mat.emissiveIntensity = m.userData.glowDay + m.userData.glow * p.night * 2.4
      })
    apply()
    const id = setTimeout(apply, 1500) // modèles chargés après coup
    return () => clearTimeout(id)
  }, [scene, p])

  useFrame(() => {
    // l'ombre suit la zone centrale : cadre fixe, assez large pour le quartier
    sun.current?.target.position.set(0, 0, -6)
    sun.current?.target.updateMatrixWorld()
  })

  const S = 2048 * (LOW ? 1 : 2)
  return (
    <>
      <Environment files={p.hdr} background />
      <directionalLight
        ref={sun}
        position={p.sunPos}
        color={p.sunColor}
        intensity={p.sunIntensity}
        castShadow
        shadow-mapSize={[S, S]}
        shadow-camera-left={-78}
        shadow-camera-right={78}
        shadow-camera-top={62}
        shadow-camera-bottom={-62}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0005}
        shadow-normalBias={0.11}
        shadow-radius={3}
      />
    </>
  )
}

export function Effects() {
  const tod = useUi((s) => s.tod)
  const shot = useUi((s) => s.shot)
  const p = PRESETS[tod]
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.toneMappingExposure = p.exposure
  }, [gl, p])
  if (NO_FX) return null
  // l'effet maquette est plus marqué sur les plans larges
  const wide = shot === 'hero' || shot === 'top' || shot === 'roundabout' || shot === 'free'
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={2.2} intensity={2.6} distanceFalloff={0.6} quality={LOW ? 'low' : 'medium'} halfRes={LOW} color="#0b1020" />
      <Bloom mipmapBlur intensity={p.bloom} luminanceThreshold={1.05} luminanceSmoothing={0.25} radius={0.7} />
      <TiltShift2 blur={wide ? 0.11 : 0.05} taper={0.55} samples={LOW ? 6 : 10} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <HueSaturation saturation={p.saturation} />
      <BrightnessContrast contrast={p.contrast} />
      <Vignette offset={0.32} darkness={0.5} />
      <SMAA />
    </EffectComposer>
  )
}
