// Plan du quartier, en mètres. X vers l'est, Z vers le sud, Y vers le haut.
// Le boulevard suit l'axe X (z = 0). L'auto-école est côté nord, face au sud.

export const LANE = 1.75 // demi-écart entre les deux voies
export const ROAD_HALF = 3.5
export const SIDEWALK = 4
export const FACADE_N = -(ROAD_HALF + SIDEWALK) // -7.5 : alignement des façades nord
export const FACADE_S = ROAD_HALF + SIDEWALK

export const ROUNDABOUT = { x: 60, laneR: 8.5, islandR: 5, outerR: 12.5 }

/** Passage piéton et feux, à l'ouest de l'auto-école */
export const CROSSING = { x: -16, half: 2, stopNorthLane: -12.6, stopSouthLane: -19.4 }

/** Rue transversale partant vers le nord */
export const SIDE_STREET = { x: -24, half: 3, sidewalk: 2 }

export const SCHOOL = {
  x0: -11.5,
  x1: 3.5,
  zFront: -9,
  zBack: -20,
  groundH: 3.7,
  upperH: 3.3,
  /** cloison vitrée entre la salle de code (ouest) et l'accueil (est) */
  partitionX: -2.2,
}

export const LOT = {
  x0: 4.5,
  x1: 28.5,
  zFront: FACADE_N,
  zBack: -22.5,
  aisleZ: -12.8,
  spotZ: -18.6, // centre d'une voiture garée
  spotDepth: 5,
  spotW: 2.6,
  /** places 0 à 4 : voitures de l'école ; 5 et 6 : véhicules en stationnement */
  spotsX: [7.4, 10, 12.6, 15.2, 17.8, 20.4, 23] as number[],
  schoolSpots: 5,
  entryX: 25.6,
  exitX: 6.6,
}

export const PARK = { x0: -30, x1: 30, z0: FACADE_S, z1: 36 }

/** Cycle des feux (secondes) */
export const LIGHT = { green: 18, orange: 3, red: 11 }
export const LIGHT_CYCLE = LIGHT.green + LIGHT.orange + LIGHT.red

export type LightPhase = 'green' | 'orange' | 'red'
export function lightPhase(t: number): LightPhase {
  const u = ((t % LIGHT_CYCLE) + LIGHT_CYCLE) % LIGHT_CYCLE
  return u < LIGHT.green ? 'green' : u < LIGHT.green + LIGHT.orange ? 'orange' : 'red'
}
/** Les piétons traversent pendant le rouge voitures, avec une marge de dégagement */
export function pedestriansMayCross(t: number): boolean {
  const u = ((t % LIGHT_CYCLE) + LIGHT_CYCLE) % LIGHT_CYCLE
  const redStart = LIGHT.green + LIGHT.orange
  return u > redStart + 0.8 && u < LIGHT_CYCLE - 5.5
}

export const BRAND = {
  name: 'Auto-école du Parc',
  short: 'AUTO-ÉCOLE DU PARC',
  city: 'Lyon',
  color: '#0b3aa8',
  accent: '#ffcc00',
}
