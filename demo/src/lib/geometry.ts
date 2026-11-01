import type { Building, Lot } from '../data/types'

export const floorHeight = (b: Building, f: number) => (f === 0 ? (b.groundH ?? b.floorH) : b.floorH)
export const floorY = (b: Building, f: number) => (f === 0 ? 0 : (b.groundH ?? b.floorH) + (f - 1) * b.floorH)
export const buildingHeight = (b: Building) => floorY(b, b.floors)
export const buildingWidth = (b: Building) => b.cols * b.lotW
/** Coordonnée z de la façade avant */
export const frontZ = (b: Building) => b.position[1] + b.depth / 2

export function lotBox(lot: Lot, b: Building) {
  const width = buildingWidth(b)
  const x0 = b.position[0] - width / 2
  const x = x0 + (lot.col + lot.spanCols / 2) * b.lotW
  const y0 = floorY(b, lot.floor)
  const y1 = floorY(b, lot.floor + lot.spanFloors)
  return {
    center: [x, (y0 + y1) / 2, b.position[1]] as [number, number, number],
    size: [lot.spanCols * b.lotW, y1 - y0, b.depth] as [number, number, number],
    top: y1,
  }
}

/** Rues : z de la rue centrale, de l'avenue, x de la rue latérale */
export const STREETS = {
  middle: { z: 0, half: 2 },
  avenue: { z: 13.5, half: 2 },
  side: { x: 19, half: 2 },
}

/** Emplacement du camion de l'artisan + porte d'entrée, pour un bâtiment */
export function artisanPath(b: Building) {
  const back = b.position[1] < 0
  const curbZ = back ? STREETS.middle.z - 1.1 : STREETS.avenue.z - 1.1
  const sidewalkZ = back ? STREETS.middle.z - STREETS.middle.half - 0.6 : STREETS.avenue.z - STREETS.avenue.half - 0.6
  const doorX = b.position[0] + (b.style === 'haussmann' ? buildingWidth(b) / 2 - 0.6 : 0.3)
  const doorZ = frontZ(b) + 0.35
  const vanX = b.position[0] + 1.5
  return {
    van: [vanX, curbZ] as [number, number],
    waypoints: [
      [vanX - 1.3, curbZ - 0.2],
      [vanX - 1.3, sidewalkZ],
      [doorX, sidewalkZ],
      [doorX, doorZ],
    ] as [number, number][],
  }
}
