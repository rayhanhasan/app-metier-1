import { CROSSING, LANE, LOT, PARK, ROUNDABOUT, SCHOOL, SIDE_STREET } from '../world'
import { filletPath, nearestS, smoothPath, type P2, type Path } from './path'

// ── Boucle principale : boulevard + demi-tour par les deux ronds-points ──
// Circulation à droite ; les giratoires se prennent dans le sens anti-horaire (vu du dessus).
function buildLoop(): Path {
  const R = ROUNDABOUT
  const pts: P2[] = []
  const arc = (cx: number, from: number, to: number) => {
    // angle mesuré depuis l'est, positif vers le nord (z négatif)
    for (let a = from; a <= to + 0.01; a += 22.5) {
      const r = (a * Math.PI) / 180
      pts.push([cx + Math.cos(r) * R.laneR, -Math.sin(r) * R.laneR])
    }
  }
  // voie nord, vers l'ouest
  for (let x = R.x - 20; x >= -R.x + 20; x -= 10) pts.push([x, -LANE])
  pts.push([-R.x + 14.5, -LANE - 0.4])
  arc(-R.x, 35, 325) // giratoire ouest
  pts.push([-R.x + 14.5, LANE + 0.4])
  // voie sud, vers l'est
  for (let x = -R.x + 20; x <= R.x - 20; x += 10) pts.push([x, LANE])
  pts.push([R.x - 14.5, LANE + 0.4])
  arc(R.x, 215, 505) // giratoire est
  pts.push([R.x - 14.5, -LANE - 0.4])
  return smoothPath(pts, true, 0.2)
}

export const LOOP = buildLoop()

export const S = {
  /** ligne d'arrêt du feu, voie nord (vers l'ouest) */
  stopNorth: nearestS(LOOP, CROSSING.stopNorthLane, -LANE),
  /** ligne d'arrêt du feu, voie sud (vers l'est) */
  stopSouth: nearestS(LOOP, CROSSING.stopSouthLane, LANE),
  /** point où une voiture de l'école quitte la boucle pour entrer au parking */
  leave: nearestS(LOOP, LOT.entryX + 7, -LANE),
  /** point où elle rejoint la boucle en sortant du parking */
  join: nearestS(LOOP, LOT.exitX - 7.5, -LANE),
}

export interface SpotRoutes {
  /** boucle → place (marche avant) */
  inPath: Path
  /** longueur de la fin de inPath parcourue en marche arrière pour sortir de la place */
  backLen: number
  /** allée → sortie → voie nord (marche avant) */
  outPath: Path
}

const TURN = 3.6

function buildSpot(x: number): SpotRoutes {
  const leaveX = LOT.entryX + 7
  const inPath = filletPath(
    [
      [leaveX, -LANE],
      [LOT.entryX + 3.2, -LANE],
      [LOT.entryX, -6.2],
      [LOT.entryX, LOT.aisleZ],
      [x, LOT.aisleZ],
      [x, LOT.spotZ],
    ],
    TURN,
  )
  // La voiture recule le long de la fin de inPath, jusqu'à être dans l'allée, nez vers l'ouest
  const startX = x + TURN + 0.4
  const backLen = inPath.total - nearestS(inPath, startX, LOT.aisleZ)
  const outPath = filletPath(
    [
      [startX, LOT.aisleZ],
      [LOT.exitX, LOT.aisleZ],
      [LOT.exitX, -6.2],
      [LOT.exitX - 3.4, -LANE],
      [LOT.exitX - 7.5, -LANE],
    ],
    TURN,
  )
  return { inPath, backLen, outPath }
}

export const SPOTS: SpotRoutes[] = LOT.spotsX.slice(0, LOT.schoolSpots).map(buildSpot)

// ── Piétons ───────────────────────────────────────────────────
const nIn = -5.9 // trottoir nord, côté façades
const nOut = -4.6 // trottoir nord, côté chaussée
const sIn = 5.9
const sOut = 4.6
const cw = CROSSING.x

export interface WalkRoute {
  path: Path
  /** abscisses où il faut attendre le feu piéton avant de traverser */
  gates: number[]
}

function walk(points: P2[], gatePoints: P2[] = []): WalkRoute {
  const path = filletPath(points, 0.9, true, 0.15)
  return { path, gates: gatePoints.map((g) => nearestS(path, g[0], g[1])) }
}

export const WALKS: WalkRoute[] = [
  // tour du trottoir nord
  walk([
    [-50, nIn], [SIDE_STREET.x - 5.5, nIn], [SIDE_STREET.x - 5.5, nOut - 0.2], [SIDE_STREET.x + 5.5, nOut - 0.2], [SIDE_STREET.x + 5.5, nIn],
    [48, nIn], [48, nOut], [-50, nOut],
  ]),
  // tour du trottoir sud
  walk([
    [-50, sOut], [48, sOut], [48, sIn], [-50, sIn],
  ]),
  // traversée : auto-école → passage piéton → square → retour
  walk(
    [
      [SCHOOL.x1 - 2.5, nIn - 1.2], [cw + 0.9, nIn], [cw + 0.9, -3.9], [cw + 0.9, 3.9], [cw + 0.9, sIn + 2.5],
      [-6, PARK.z0 + 9], [10, PARK.z0 + 12], [16, sIn + 3], [16, sOut], [cw - 0.9, sOut], [cw - 0.9, 3.9],
      [cw - 0.9, -3.9], [cw - 0.9, nOut], [SCHOOL.x1 - 2.5, nOut],
    ],
    [
      [cw + 0.9, -3.9],
      [cw - 0.9, 3.9],
    ],
  ),
  // promenade dans le square
  walk([
    [-24, PARK.z0 + 4], [-8, PARK.z0 + 7], [8, PARK.z0 + 5], [24, PARK.z0 + 9], [22, PARK.z0 + 20], [4, PARK.z0 + 17], [-12, PARK.z0 + 21], [-25, PARK.z0 + 15],
  ]),
]
