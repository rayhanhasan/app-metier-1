import { useMemo } from 'react'
import * as THREE from 'three'
import { BRAND, SCHOOL } from '../world'
import { canvasTexture, FONT, usePbr } from './materials'
import { Model } from './Model'
import { rect, worldBox } from './flat'

// ─────────────────────────────────────────────────────────────
//  Bâtiment de l'auto-école : rez-de-chaussée entièrement vitré
//  (salle de code à l'ouest, accueil à l'est), un étage de bureaux.
// ─────────────────────────────────────────────────────────────

const { x0, x1, zFront, zBack } = SCHOOL
const W = x1 - x0
const D = zFront - zBack
export const FLOOR_Y = 0.17
const CEIL = FLOOR_Y + 3.35 // sous-face de la dalle
const SLAB = 0.4
const UP0 = CEIL + SLAB // plancher de l'étage
const UP1 = UP0 + SCHOOL.upperH
const BAYS = 6
const INSET = 0.35
const bayW = (W - INSET * 2) / BAYS
export const bayX = (i: number) => x0 + INSET + bayW * i
/** cloison vitrée salle de code / accueil : sur le 4e montant */
export const PARTITION_X = bayX(4)
const DOOR_BAY = 4

export interface CastSpot {
  x: number
  z: number
  y: number
  heading: number
  anim: 'sit' | 'idle' | 'talk'
  role: string
  seatHeight?: number
}

const WEST = -Math.PI / 2
const EAST = Math.PI / 2
const SOUTH = 0
const NORTH = Math.PI

const CHAIR_ROWS = [-8.9, -7.3, -5.7]
const CHAIR_Z = [-10.9, -12.5, -14.1, -15.7]

/** Qui est où à l'intérieur (utilisé par People.tsx) */
export const INTERIOR_CAST: CastSpot[] = [
  // élèves en salle de code (9 places occupées sur 12)
  ...CHAIR_ROWS.flatMap((cx, r) => CHAIR_Z.filter((_, k) => (r * 4 + k) % 4 !== (r === 1 ? 2 : 3)).map((cz) => ({ x: cx, z: cz, y: FLOOR_Y, heading: WEST, anim: 'sit' as const, role: 'Élève · séance de code' }))),
  // monitrice qui anime la séance, près de l'écran
  { x: -10.3, z: -17.4, y: FLOOR_Y, heading: EAST - 0.5, anim: 'talk', role: 'Monitrice · anime le code' },
  // secrétaire à l'accueil
  { x: 1.25, z: -17.55, y: FLOOR_Y, heading: SOUTH, anim: 'sit', role: 'Secrétaire · accueil' },
  // client au comptoir
  { x: 1.0, z: -14.6, y: FLOOR_Y, heading: NORTH, anim: 'idle', role: 'Inscription en cours' },
  // personne qui attend sur la banquette
  { x: 2.55, z: -11.6, y: FLOOR_Y, heading: WEST, anim: 'sit', role: 'Élève · attend sa leçon' },
]

function useMats() {
  return useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ color: '#23272e', roughness: 0.42, metalness: 0.65 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#dff0f7', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.14, envMapIntensity: 2.4, depthWrite: false, side: THREE.DoubleSide }),
      glassUp: new THREE.MeshPhysicalMaterial({ color: '#31465c', roughness: 0.04, metalness: 0.3, envMapIntensity: 2.2 }),
      concrete: new THREE.MeshStandardMaterial({ color: '#cfccc5', roughness: 0.85 }),
      dark: new THREE.MeshStandardMaterial({ color: '#2e333b', roughness: 0.7 }),
      white: new THREE.MeshStandardMaterial({ color: '#c9c5bb', roughness: 0.9 }),
      blue: new THREE.MeshStandardMaterial({ color: BRAND.color, roughness: 0.6 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#d8d5cd', roughness: 0.95, side: THREE.DoubleSide }),
      panel: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4dd', emissiveIntensity: 0.75, roughness: 1 }),
      metal: new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.35, metalness: 0.85 }),
    }),
    [],
  )
}

function Box({ p, s, m, shadow = true }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; shadow?: boolean }) {
  return (
    <mesh position={p} material={m} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  )
}

/** Baie vitrée : verre + traverses haute et basse */
function Glazing({ a, b, m, railM }: { a: [number, number]; b: [number, number]; m: THREE.Material; railM: THREE.Material }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  const rot = Math.atan2(-(b[1] - a[1]), b[0] - a[0])
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const h = CEIL - FLOOR_Y
  return (
    <group position={[mid[0], 0, mid[1]]} rotation={[0, rot, 0]}>
      <mesh position={[0, FLOOR_Y + h / 2, 0]} material={m} renderOrder={5}>
        <planeGeometry args={[len, h]} />
      </mesh>
      <Box p={[0, FLOOR_Y + 0.06, 0]} s={[len, 0.12, 0.09]} m={railM} shadow={false} />
      <Box p={[0, CEIL - 0.05, 0]} s={[len, 0.1, 0.09]} m={railM} shadow={false} />
    </group>
  )
}

function Fascia({ mats }: { mats: ReturnType<typeof useMats> }) {
  const tex = canvasTexture('fascia', 2600, 136, (g, w, h) => {
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, h)
    g.fillStyle = BRAND.accent
    g.fillRect(0, h - 10, w, 10)
    // logo : volant stylisé
    const cx = 92
    const cy = h / 2 - 4
    g.strokeStyle = '#fff'
    g.lineWidth = 9
    g.beginPath()
    g.arc(cx, cy, 40, 0, Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.moveTo(cx - 38, cy + 4)
    g.lineTo(cx + 38, cy + 4)
    g.moveTo(cx, cy + 4)
    g.lineTo(cx, cy + 38)
    g.stroke()
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(cx, cy + 3, 11, 0, Math.PI * 2)
    g.fill()
    g.textBaseline = 'middle'
    g.font = `800 78px ${FONT}`
    g.fillText(BRAND.short, 165, h / 2 - 2)
    g.font = `500 36px ${FONT}`
    g.textAlign = 'right'
    g.fillStyle = 'rgba(255,255,255,0.92)'
    g.fillText('Permis B  ·  Conduite accompagnée  ·  Boîte auto', w - 40, h / 2 - 2)
  })
  const side = canvasTexture('fascia-side', 1024, 136, (g, w, h) => {
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, h)
    g.fillStyle = BRAND.accent
    g.fillRect(0, h - 10, w, 10)
    g.fillStyle = '#fff'
    g.textBaseline = 'middle'
    g.textAlign = 'center'
    g.font = `800 78px ${FONT}`
    g.fillText('AUTO-ÉCOLE', w / 2, h / 2 - 2)
  })
  const y = CEIL + SLAB / 2 + 0.12
  const hBand = 0.95
  return (
    <group>
      <Box p={[(x0 + x1) / 2, y, zFront + 0.22]} s={[W + 0.5, hBand, 0.5]} m={mats.blue} />
      <mesh position={[(x0 + x1) / 2, y, zFront + 0.475]} userData={{ glow: 1.6 }}>
        <planeGeometry args={[W + 0.3, hBand]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.55} />
      </mesh>
      <Box p={[x1 + 0.22, y, (zFront + zBack) / 2]} s={[0.5, hBand, D + 0.5]} m={mats.blue} />
      <mesh position={[x1 + 0.475, y, zFront - 3.6]} rotation={[0, Math.PI / 2, 0]} userData={{ glow: 1.6 }}>
        <planeGeometry args={[7, hBand]} />
        <meshStandardMaterial map={side} emissiveMap={side} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.55} />
      </mesh>
    </group>
  )
}

function UpperFloor({ mats }: { mats: ReturnType<typeof useMats> }) {
  const plaster = usePbr('white_plaster_02', 3, { color: '#ffffff' })
  const h = SCHOOL.upperH
  const cy = UP0 + h / 2
  const upperGeo = useMemo(() => worldBox(W, h, D), [h])
  const win = (key: string, p: [number, number, number], rot: number, w = 1.55) => (
    <group key={key} position={p} rotation={[0, rot, 0]}>
      <mesh material={mats.glassUp} position={[0, 0, 0.02]}>
        <planeGeometry args={[w, 1.7]} />
      </mesh>
      <Box p={[0, 0.88, 0.04]} s={[w + 0.16, 0.08, 0.1]} m={mats.frame} shadow={false} />
      <Box p={[0, -0.88, 0.07]} s={[w + 0.26, 0.07, 0.18]} m={mats.concrete} shadow={false} />
      <Box p={[-w / 2 - 0.04, 0, 0.04]} s={[0.08, 1.76, 0.1]} m={mats.frame} shadow={false} />
      <Box p={[w / 2 + 0.04, 0, 0.04]} s={[0.08, 1.76, 0.1]} m={mats.frame} shadow={false} />
      <Box p={[0, 0, 0.04]} s={[0.05, 1.7, 0.06]} m={mats.frame} shadow={false} />
    </group>
  )
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, cy, (zFront + zBack) / 2]} material={plaster} geometry={upperGeo} castShadow receiveShadow />
      {Array.from({ length: BAYS }, (_, i) => win(`f${i}`, [bayX(i) + bayW / 2, cy + 0.1, zFront], 0))}
      {[-11, -14, -17].map((z) => win(`e${z}`, [x1, cy + 0.1, z], Math.PI / 2))}
      {[-11, -14, -17].map((z) => win(`w${z}`, [x0, cy + 0.1, z], -Math.PI / 2))}
      {/* toiture */}
      <Box p={[(x0 + x1) / 2, UP1 + 0.1, (zFront + zBack) / 2]} s={[W + 0.3, 0.2, D + 0.3]} m={mats.concrete} />
      {[
        [(x0 + x1) / 2, zFront + 0.05, W + 0.3, 0.2],
        [(x0 + x1) / 2, zBack - 0.05, W + 0.3, 0.2],
        [x0 - 0.05, (zFront + zBack) / 2, 0.2, D + 0.3],
        [x1 + 0.05, (zFront + zBack) / 2, 0.2, D + 0.3],
      ].map(([px, pz, sx, sz], i) => (
        <Box key={i} p={[px, UP1 + 0.45, pz]} s={[sx, 0.5, sz]} m={mats.white} />
      ))}
      <Box p={[x0 + 3.2, UP1 + 0.75, zBack + 2.6]} s={[2.2, 1.0, 1.4]} m={mats.metal} />
      <Box p={[x0 + 6.2, UP1 + 0.6, zBack + 2.4]} s={[1.3, 0.7, 1.1]} m={mats.metal} />
      <Box p={[x1 - 3.5, UP1 + 0.3, zFront - 3.5]} s={[2.4, 0.25, 2.4]} m={mats.glassUp} />
    </group>
  )
}

function Interior({ mats }: { mats: ReturnType<typeof useMats> }) {
  const floor = usePbr('laminate_floor_02', 2.2, { color: '#9c8c74' })
  const floorGeo = useMemo(() => rect(x0 + 0.1, x1 - 0.1, zBack + 0.1, zFront - 0.1, FLOOR_Y), [])
  const screen = canvasTexture('code-screen', 1024, 576, (g, w, h) => {
    // diapositive d'une séance de code : situation + réponses
    const sky = g.createLinearGradient(0, 0, 0, h * 0.55)
    sky.addColorStop(0, '#8fc0ea')
    sky.addColorStop(1, '#dbeaf5')
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#6f9a5c'
    g.fillRect(0, h * 0.5, w, h * 0.2)
    g.fillStyle = '#4a4e55'
    g.beginPath()
    g.moveTo(w * 0.32, h * 0.72)
    g.lineTo(w * 0.47, h * 0.42)
    g.lineTo(w * 0.53, h * 0.42)
    g.lineTo(w * 0.68, h * 0.72)
    g.fill()
    g.strokeStyle = '#fff'
    g.lineWidth = 5
    g.setLineDash([22, 18])
    g.beginPath()
    g.moveTo(w * 0.5, h * 0.72)
    g.lineTo(w * 0.5, h * 0.42)
    g.stroke()
    g.setLineDash([])
    // panneau triangulaire
    g.fillStyle = '#fff'
    g.strokeStyle = '#d11'
    g.lineWidth = 12
    g.beginPath()
    g.moveTo(w * 0.78, h * 0.2)
    g.lineTo(w * 0.86, h * 0.44)
    g.lineTo(w * 0.7, h * 0.44)
    g.closePath()
    g.fill()
    g.stroke()
    g.fillStyle = '#10151c'
    g.fillRect(0, h * 0.72, w, h * 0.28)
    g.fillStyle = '#fff'
    g.font = `700 34px ${FONT}`
    g.fillText('Question 14 / 40 · Je peux dépasser ce véhicule :', 30, h * 0.72 + 48)
    g.font = `600 30px ${FONT}`
    const ans = ['A  Oui', 'B  Non', 'C  Oui, si je klaxonne', 'D  Non, la ligne est continue']
    ans.forEach((a, i) => {
      g.fillStyle = i === 1 ? '#ffcc00' : '#cbd5e1'
      g.fillText(a, 30 + (i % 2) * 500, h * 0.72 + 100 + Math.floor(i / 2) * 44)
    })
  })
  const poster = canvasTexture('poster', 512, 720, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, 150)
    g.fillStyle = '#fff'
    g.font = `800 60px ${FONT}`
    g.fillText('Permis B', 34, 96)
    g.fillStyle = '#0f172a'
    g.font = `700 40px ${FONT}`
    ;['20 h de conduite', 'Code en salle', 'ou en ligne', 'Examen blanc'].forEach((t, i) => g.fillText(t, 34, 230 + i * 62))
    g.fillStyle = BRAND.color
    g.font = `800 96px ${FONT}`
    g.fillText('1 290 €', 34, 610)
  })
  const brandWall = canvasTexture('brand-wall', 1024, 512, (g, w, h) => {
    g.fillStyle = BRAND.color
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#fff'
    g.textAlign = 'center'
    g.font = `800 92px ${FONT}`
    g.fillText('Auto-école du Parc', w / 2, 230)
    g.fillStyle = BRAND.accent
    g.font = `600 44px ${FONT}`
    g.fillText('Depuis 1998 · 94 % de réussite', w / 2, 310)
  })

  const zc = (zFront + zBack) / 2
  const panels: [number, number][] = []
  for (let px = x0 + 2; px < x1 - 1; px += 3) for (const pz of [zFront - 2.4, zc, zBack + 2.4]) panels.push([px, pz])

  return (
    <group>
      <mesh geometry={floorGeo} material={floor} receiveShadow />
      {/* plafond et dalles lumineuses */}
      <mesh position={[(x0 + x1) / 2, CEIL - 0.01, zc]} rotation={[Math.PI / 2, 0, 0]} material={mats.ceiling}>
        <planeGeometry args={[W - 0.2, D - 0.2]} />
      </mesh>
      {panels.map(([px, pz], i) => (
        <mesh key={i} position={[px, CEIL - 0.03, pz]} rotation={[Math.PI / 2, 0, 0]} material={mats.panel} userData={{ glow: 1 }}>
          <planeGeometry args={[1.2, 0.6]} />
        </mesh>
      ))}
      <pointLight position={[-7, CEIL - 0.5, -12.5]} intensity={7} distance={13} decay={1.8} color="#fff3df" />
      <pointLight position={[-6, CEIL - 0.5, -17]} intensity={5} distance={11} decay={1.8} color="#fff3df" />
      <pointLight position={[1, CEIL - 0.5, -13.5]} intensity={7} distance={12} decay={1.8} color="#fff3df" />

      {/* murs pleins : fond (nord), ouest, et moitié arrière de l'est */}
      <Box p={[(x0 + x1) / 2, (FLOOR_Y + CEIL) / 2, zBack + 0.12]} s={[W, CEIL - FLOOR_Y, 0.24]} m={mats.white} />
      <Box p={[x0 + 0.12, (FLOOR_Y + CEIL) / 2, zc]} s={[0.24, CEIL - FLOOR_Y, D]} m={mats.white} />
      <Box p={[x1 - 0.12, (FLOOR_Y + CEIL) / 2, (zBack + (zFront - 6)) / 2]} s={[0.24, CEIL - FLOOR_Y, zFront - 6 - zBack]} m={mats.white} />
      {/* mur de marque derrière l'accueil */}
      <mesh position={[(PARTITION_X + x1) / 2, 1.95, zBack + 0.25]}>
        <planeGeometry args={[x1 - PARTITION_X - 0.4, 2.9]} />
        <meshStandardMaterial map={brandWall} roughness={0.8} emissiveMap={brandWall} emissive="#ffffff" emissiveIntensity={0.12} />
      </mesh>
      {/* affiches en salle de code */}
      {[-9.5, -7.6].map((px) => (
        <mesh key={px} position={[px, 2.0, zBack + 0.25]}>
          <planeGeometry args={[1.3, 1.83]} />
          <meshStandardMaterial map={poster} roughness={0.8} />
        </mesh>
      ))}

      {/* cloison vitrée entre la salle de code et l'accueil (porte ouverte côté vitrine) */}
      <Glazing a={[PARTITION_X, zBack + 0.3]} b={[PARTITION_X, zFront - 2.2]} m={mats.glass} railM={mats.frame} />
      <Box p={[PARTITION_X, (FLOOR_Y + CEIL) / 2, zFront - 2.2]} s={[0.09, CEIL - FLOOR_Y, 0.09]} m={mats.frame} shadow={false} />

      {/* salle de code : écran mural + chaises */}
      <group position={[x0 + 0.27, 2.05, -13.3]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0, -0.03]} s={[3.1, 1.85, 0.07]} m={mats.dark} shadow={false} />
        <mesh position={[0, 0, 0.012]} userData={{ glow: 1.3 }}>
          <planeGeometry args={[2.95, 1.66]} />
          <meshStandardMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.4} />
        </mesh>
      </group>
      {CHAIR_ROWS.flatMap((cx) =>
        CHAIR_Z.map((cz) => <Model key={`${cx}${cz}`} file="props/chair" position={[cx, FLOOR_Y, cz]} rotation={WEST} fallback={[0.45, 0.46, 0.45]} fallbackColor="#3b4654" />),
      )}

      {/* accueil */}
      <Model file="props/reception-counter" position={[1.1, FLOOR_Y, -16.3]} rotation={SOUTH} fallback={[2.6, 1.05, 0.65]} fallbackColor="#e9e4da" />
      <Model file="props/office-chair" position={[1.25, FLOOR_Y, -17.55]} rotation={SOUTH} fallback={[0.5, 0.48, 0.5]} fallbackColor="#2b3440" />
      <Model file="props/monitor" position={[1.7, FLOOR_Y + 1.06, -16.35]} rotation={NORTH} />
      <Model file="props/sofa" position={[2.75, FLOOR_Y, -11.6]} rotation={WEST} fallback={[1.9, 0.44, 0.8]} fallbackColor="#44506a" />
      <Model file="props/plant-pot" position={[2.85, FLOOR_Y, -9.75]} />
      <Model file="props/plant-pot" position={[-1.0, FLOOR_Y, -18.9]} />
      <Model file="props/shelf" position={[-0.2, FLOOR_Y, -19.4]} rotation={SOUTH} />
      <Model file="props/water-dispenser" position={[2.9, FLOOR_Y, -14.2]} rotation={WEST} />
    </group>
  )
}

export function School() {
  const mats = useMats()
  const zc = (zFront + zBack) / 2
  const colH = CEIL - FLOOR_Y
  const cy = FLOOR_Y + colH / 2
  const doorA = bayX(DOOR_BAY)
  const doorB = bayX(DOOR_BAY + 1)
  const zSide = zFront - 6

  return (
    <group>
      {/* dalle de sol et seuil */}
      <Box p={[(x0 + x1) / 2, FLOOR_Y / 2, zc]} s={[W + 0.2, FLOOR_Y, D + 0.2]} m={mats.concrete} />
      <Box p={[(doorA + doorB) / 2, 0.15, zFront + 0.9]} s={[bayW + 0.8, 0.03, 1.7]} m={mats.dark} shadow={false} />

      {/* montants de la façade vitrée (sud) */}
      {Array.from({ length: BAYS + 1 }, (_, i) => (
        <Box key={i} p={[bayX(i), cy, zFront - 0.06]} s={[i === 0 || i === BAYS ? 0.34 : 0.1, colH, 0.2]} m={mats.frame} />
      ))}
      {Array.from({ length: BAYS }, (_, i) =>
        i === DOOR_BAY ? null : <Glazing key={i} a={[bayX(i) + 0.05, zFront - 0.06]} b={[bayX(i + 1) - 0.05, zFront - 0.06]} m={mats.glass} railM={mats.frame} />,
      )}
      {/* porte vitrée à deux vantaux, un vantail ouvert */}
      <group position={[doorA + 0.05, 0, zFront - 0.06]}>
        <mesh position={[(bayW - 0.1) * 0.25, FLOOR_Y + 1.15, 0]} material={mats.glass} renderOrder={5}>
          <planeGeometry args={[(bayW - 0.1) / 2, 2.3]} />
        </mesh>
        <Box p={[(bayW - 0.1) * 0.25, FLOOR_Y + 1.1, 0.05]} s={[0.04, 0.9, 0.04]} m={mats.metal} shadow={false} />
        <group position={[bayW - 0.1, 0, 0]} rotation={[0, -1.15, 0]}>
          <mesh position={[-(bayW - 0.1) * 0.25, FLOOR_Y + 1.15, 0]} material={mats.glass} renderOrder={5}>
            <planeGeometry args={[(bayW - 0.1) / 2, 2.3]} />
          </mesh>
          <Box p={[-(bayW - 0.1) * 0.25, FLOOR_Y + 2.32, 0]} s={[(bayW - 0.1) / 2, 0.06, 0.06]} m={mats.frame} shadow={false} />
        </group>
        <Box p={[(bayW - 0.1) / 2, FLOOR_Y + 2.36, 0]} s={[bayW - 0.1, 0.1, 0.1]} m={mats.frame} shadow={false} />
        <mesh position={[(bayW - 0.1) / 2, FLOOR_Y + 2.9, 0]} material={mats.glass} renderOrder={5}>
          <planeGeometry args={[bayW - 0.1, colH - 2.45]} />
        </mesh>
      </group>
      {/* auvent au-dessus de l'entrée */}
      <Box p={[(doorA + doorB) / 2, CEIL - 0.25, zFront + 0.95]} s={[bayW + 1.2, 0.1, 1.9]} m={mats.frame} />

      {/* façade est : vitrée côté parking sur 6 m, pleine au-delà */}
      <Box p={[x1 - 0.06, cy, zFront - 0.06]} s={[0.2, colH, 0.34]} m={mats.frame} />
      <Box p={[x1 - 0.06, cy, zFront - 3]} s={[0.2, colH, 0.1]} m={mats.frame} />
      <Box p={[x1 - 0.06, cy, zSide]} s={[0.2, colH, 0.2]} m={mats.frame} />
      <Glazing a={[x1 - 0.06, zFront - 0.2]} b={[x1 - 0.06, zFront - 2.95]} m={mats.glass} railM={mats.frame} />
      <Glazing a={[x1 - 0.06, zFront - 3.05]} b={[x1 - 0.06, zSide + 0.1]} m={mats.glass} railM={mats.frame} />

      {/* dalle haute */}
      <Box p={[(x0 + x1) / 2, CEIL + SLAB / 2, zc]} s={[W + 0.1, SLAB, D + 0.1]} m={mats.concrete} />

      <Interior mats={mats} />
      <Fascia mats={mats} />
      <UpperFloor mats={mats} />
    </group>
  )
}
