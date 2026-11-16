import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { hasModel, modelUrl } from '../assets'

useGLTF.setDecoderPath('./draco/')

export interface ModelProps {
  file: string
  position?: [number, number, number]
  rotation?: number
  scale?: number | [number, number, number]
  castShadow?: boolean
  /** appelé une fois sur le clone, pour ajuster des matériaux */
  tune?: (root: THREE.Object3D) => void
  /** volume de repli (largeur, hauteur, profondeur) si le modèle est absent */
  fallback?: [number, number, number]
  fallbackColor?: string
}

function Loaded({ file, position, rotation = 0, scale = 1, castShadow = true, tune }: ModelProps) {
  const { scene } = useGLTF(modelUrl(file))
  const obj = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = castShadow
        m.receiveShadow = true
      }
    })
    tune?.(c)
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, castShadow])
  return <primitive object={obj} position={position} rotation={[0, rotation, 0]} scale={scale} />
}

/** Modèle glTF placé dans la scène ; volume simple si le fichier n'est pas disponible. */
export function Model(props: ModelProps) {
  if (hasModel(props.file)) return <Loaded {...props} />
  if (!props.fallback) return null
  const [w, h, d] = props.fallback
  const p = props.position ?? [0, 0, 0]
  return (
    <mesh position={[p[0], p[1] + h / 2, p[2]]} rotation={[0, props.rotation ?? 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={props.fallbackColor ?? '#9aa3ad'} roughness={0.8} />
    </mesh>
  )
}
