import * as THREE from 'three/webgpu'
import { pass, mrt, output, normalView, directionToColor, colorToDirection, uniform, color, mix, positionWorld, float, smoothstep } from 'three/tsl'
import { ao } from 'three/addons/tsl/display/GTAONode.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

const q = new URLSearchParams(location.search)
const FX = q.get('fx') !== '0'
const NIGHT = q.has('night')

const renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL: q.has('gl') })
renderer.setPixelRatio(1)
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = FX ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
renderer.toneMappingExposure = NIGHT ? 0.75 : 0.78
document.body.appendChild(renderer.domElement)
await renderer.init()

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(26, innerWidth / innerHeight, 0.5, 300)
camera.position.set(13, 9.5, 17)
camera.lookAt(0.5, 0.9, 0)

// ── Lumière ──
const sun = new THREE.DirectionalLight(NIGHT ? '#8fa8ff' : '#fff1dc', FX ? (NIGHT ? 0.5 : 2.6) : 1.9)
sun.position.set(-11, 12, 9)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 })
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03
scene.add(sun)
if (FX) {
  const hdr = await new HDRLoader().loadAsync('/sky.hdr')
  hdr.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = hdr
  scene.environmentIntensity = NIGHT ? 0.12 : 0.7
  scene.background = hdr; scene.backgroundBlurriness = 0.6; scene.backgroundIntensity = NIGHT ? 0.05 : 0.9
  scene.fog = new THREE.Fog(NIGHT ? '#0b1020' : '#bcd0e6', 60, 220)
} else {
  scene.background = new THREE.Color('#eaf0f7')
  scene.add(new THREE.HemisphereLight('#ffffff', '#c7d2e2', 1.1))
}

// ── Matériaux ──
const std = (c, r = 0.8, m = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra })
const asphalt = new THREE.MeshStandardNodeMaterial({ color: '#2b2f36' })
if (FX) {
  // flaques : rugosité basse par zones (bruit simple basé sur la position monde)
  const p = positionWorld.xz.mul(0.35)
  const n = p.x.sin().mul(p.y.mul(1.7).cos()).add(p.x.mul(2.3).add(p.y).sin().mul(0.5))
  asphalt.roughnessNode = mix(float(0.92), float(NIGHT ? 0.08 : 0.35), smoothstep(0.25, 0.7, n))
} else asphalt.roughness = 1

const box = (w, h, d, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m }

// sol, route, trottoirs
box(200, 0.1, 200, std('#6f9457', 1), 0, -0.06, 0, false)
box(200, 0.1, 9, asphalt, 0, 0, 3.5, false)
box(200, 0.25, 5, std('#9aa0aa', 0.9), 0, 0.07, -3.5, false)
for (let x = -40; x < 40; x += 3) box(1.4, 0.012, 0.14, std('#f4f4f4', 0.6), x, 0.056, 3.5, false)
box(200, 0.012, 0.12, std('#f4f4f4', 0.6), 0, 0.056, -0.75, false)

// bâtiment auto-école
const wall = std('#d9cdb8', 0.85), glass = new THREE.MeshPhysicalMaterial({ color: '#1b2a3a', roughness: 0.05, metalness: 0, envMapIntensity: 1.6, clearcoat: 1 })
box(11, 4.2, 6, wall, -1, 2.3, -9)
box(11.4, 0.25, 6.4, std('#d9d2c4'), -1, 4.5, -9)
box(11, 3.6, 6, std('#f3efe6', 0.85), -1, 6.4, -9)
box(11.5, 0.3, 6.5, std('#59606b', 0.6), -1, 8.35, -9)
box(7.6, 2.5, 0.08, glass, -2.2, 1.6, -5.96)                       // vitrine
for (const x of [-4.5, -1.5, 1.5]) box(1.5, 1.7, 0.08, glass, x, 6.4, -5.96)
const interior = std('#ffd9a0', 1, 0, { emissive: '#ffb65c', emissiveIntensity: NIGHT ? 3.5 : 0.25 })
box(7.2, 2.3, 0.05, interior, -2.2, 1.6, -6.3, false)
box(1.3, 2.4, 0.08, std('#243447', 0.4), 3.2, 1.4, -5.96)          // porte
// enseigne lumineuse
const signTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#0b3aa8'; g.fillRect(0, 0, 1024, 160); g.fillStyle = '#fff'; g.font = '800 96px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AUTO-ÉCOLE DU PARC', 512, 84); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })()
const sign = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.9, 0.18), new THREE.MeshStandardMaterial({ map: signTex, emissiveMap: signTex, emissive: '#ffffff', emissiveIntensity: FX ? (NIGHT ? 2.6 : 0.9) : 0, roughness: 0.4 }))
sign.position.set(-2.2, 3.55, -5.9); sign.castShadow = true; scene.add(sign)

// arbres
const leaf = std('#3f7a3a', 0.9), trunk = std('#6b5846', 1)
for (const [x, z, s] of [[7.5, -3.6, 1.1], [-9, -3.4, 1.3], [12, -4, 0.9], [-14, -8, 1.5], [9, -11, 1.6]]) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.14 * s, 1.6 * s, 8), trunk); t.position.set(x, 0.8 * s + 0.2, z); t.castShadow = true; scene.add(t)
  for (const [dx, dy, dz, r] of [[0, 2.1, 0, 0.95], [0.5, 1.8, 0.3, 0.7], [-0.45, 1.75, -0.2, 0.75], [0.1, 2.7, -0.1, 0.6]]) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 2), leaf); l.position.set(x + dx * s, dy * s + 0.2, z + dz * s); l.castShadow = true; l.receiveShadow = true; scene.add(l) }
}
// lampadaire
box(0.1, 4, 0.1, std('#3a3f47', 0.5, 0.6), 5.4, 2.2, -1.4); box(1.0, 0.08, 0.16, std('#3a3f47', 0.5, 0.6), 5.0, 4.2, -1.4)
const bulb = box(0.4, 0.05, 0.14, std('#fff', 1, 0, { emissive: '#ffd9a0', emissiveIntensity: NIGHT ? 12 : 0 }), 4.75, 4.15, -1.4, false)
if (NIGHT && FX) { const sl = new THREE.SpotLight('#ffd09a', 180, 16, 0.9, 0.7, 1.6); sl.position.set(4.75, 4.1, -1.4); sl.target.position.set(4.2, 0, 0.5); sl.castShadow = true; scene.add(sl, sl.target)
  const pl = new THREE.PointLight('#ffb65c', 30, 9, 1.8); pl.position.set(-2.2, 1.8, -5.2); scene.add(pl) }

// ── Voitures (modèle de test : sert uniquement à juger la carrosserie) ──
const draco = new DRACOLoader().setDecoderPath('/draco/')
const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync('/car.glb')
const paint = (hex) => FX ? new THREE.MeshPhysicalMaterial({ color: hex, metalness: 0.9, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.04 }) : new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 })
const addCar = (hex, x, z, ry) => {
  const car = gltf.scene.clone(true)
  car.traverse((o) => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true
    if (o.name === 'body' || o.material?.name === 'body') o.material = paint(hex)
    else if (!FX) o.material = new THREE.MeshStandardMaterial({ color: o.material.color, roughness: 0.6 })
    if (o.material.name === 'glass' || o.name === 'glass') o.material = FX ? new THREE.MeshPhysicalMaterial({ color: '#0d1116', roughness: 0.02, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.82 }) : new THREE.MeshStandardMaterial({ color: '#334155' }) })
  car.position.set(x, 0.05, z); car.rotation.y = ry; scene.add(car)
  if (NIGHT && FX) for (const s of [-0.62, 0.62]) { const h = new THREE.SpotLight('#eaf2ff', 60, 22, 0.42, 0.6, 1.4); const d = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)); const side = new THREE.Vector3(d.z, 0, -d.x)
      h.position.set(x, 0.7, z).addScaledVector(d, -1.9).addScaledVector(side, s); h.target.position.copy(h.position).addScaledVector(d, -8).setY(0); scene.add(h, h.target) }
  return car
}
addCar('#f4f5f7', 1.2, 1.6, Math.PI / 2 + 0.06)
addCar('#0b3aa8', -6.5, 5.6, -Math.PI / 2)
addCar('#c8102e', 9.5, -0.2 + 1.6, Math.PI / 2)

// ── Post-traitement ──
let pipeline = null
if (FX) {
  pipeline = new THREE.RenderPipeline(renderer)
  const scenePass = pass(scene, camera)
  const col = scenePass.getTextureNode('output')
  const depth = scenePass.getTextureNode('depth')
  const aoPass = ao(depth, null, camera)
  aoPass.radius.value = 0.6; aoPass.thickness.value = 1.2; aoPass.distanceExponent.value = 1.4; aoPass.scale.value = 1.25
  const lit = col.mul(aoPass.getTextureNode().r)
  const focus = uniform(camera.position.distanceTo(new THREE.Vector3(1.2, 0.6, 1.6)))
  const blurred = dof(lit, scenePass.getViewZNode(), focus, uniform(7.5), uniform(q.has('nodof') ? 0 : 3.2))
  const glow = bloom(blurred, NIGHT ? 0.55 : 0.12, 0.5, NIGHT ? 0.8 : 3.0)
  pipeline.outputNode = blurred.add(glow)
}
let frames = 0
renderer.setAnimationLoop(() => { pipeline ? pipeline.render() : renderer.render(scene, camera); if (++frames === 10) { renderer.setAnimationLoop(null); window.__png = renderer.domElement.toDataURL('image/jpeg', 0.92); window.__ready = true } })
window.__backend = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl2'
