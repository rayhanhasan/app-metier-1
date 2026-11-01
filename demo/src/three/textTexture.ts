import * as THREE from 'three'

const cache = new Map<string, THREE.CanvasTexture>()

/** Texture de texte générée en local (aucune police à télécharger : la démo marche hors ligne). */
export function textTexture(text: string, opts: { color?: string; bg?: string; weight?: number; width?: number; height?: number } = {}) {
  const key = JSON.stringify([text, opts])
  const hit = cache.get(key)
  if (hit) return hit
  const { color = '#1d4ed8', bg = 'transparent', weight = 800, width = 1024, height = 160 } = opts
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  if (bg !== 'transparent') {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)
  }
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = height * 0.62
  ctx.font = `${weight} ${size}px Inter, "Segoe UI", system-ui, sans-serif`
  while (ctx.measureText(text).width > width * 0.92 && size > 10) {
    size -= 2
    ctx.font = `${weight} ${size}px Inter, "Segoe UI", system-ui, sans-serif`
  }
  ctx.fillText(text, width / 2, height / 2 + 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, tex)
  return tex
}
