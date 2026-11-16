import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Matériau PBR Poly Haven (couleur, normales, ARM) plaqué en coordonnées monde :
 * `tile` = taille d'un motif en mètres. À utiliser avec les géométries de `flat.ts`.
 */
export function usePbr(name: string, tile: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const [map, normalMap, arm] = useTexture([`./tex/${name}_diff.jpg`, `./tex/${name}_nor.jpg`, `./tex/${name}_arm.jpg`])
  return useMemo(() => {
    const prep = (t: THREE.Texture, srgb: boolean) => {
      const c = t.clone()
      c.wrapS = c.wrapT = THREE.RepeatWrapping
      c.repeat.set(1 / tile, 1 / tile)
      c.anisotropy = 8
      c.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
      c.needsUpdate = true
      return c
    }
    return new THREE.MeshStandardMaterial({
      map: prep(map, true),
      normalMap: prep(normalMap, false),
      roughnessMap: prep(arm, false),
      metalness: 0,
      ...opts,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, normalMap, arm, tile])
}

const texCache = new Map<string, THREE.CanvasTexture>()

/** Texture dessinée au canvas (enseignes, écrans, marquages). */
export function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = texCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  texCache.set(key, t)
  return t
}

export const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif'
