import type { TimeOfDay } from '../store'
import { useUi } from '../store'

export interface Preset {
  hdr: string
  sunPos: [number, number, number]
  sunColor: string
  sunIntensity: number
  envIntensity: number
  bgIntensity: number
  bgBlur: number
  exposure: number
  fog: string
  fogNear: number
  fogFar: number
  night: number // 0 = jour, 1 = nuit (pilote les émissifs et les lampadaires)
  bloom: number
  saturation: number
  contrast: number
}

export const PRESETS: Record<TimeOfDay, Preset> = {
  day: {
    hdr: './hdr/day.hdr',
    sunPos: [-55, 70, 45],
    sunColor: '#fff3df',
    sunIntensity: 3.4,
    envIntensity: 0.62,
    bgIntensity: 1.15,
    bgBlur: 0.15,
    exposure: 0.9,
    fog: '#cfdcea',
    fogNear: 110,
    fogFar: 420,
    night: 0,
    bloom: 0.25,
    saturation: 0.18,
    contrast: 0.12,
  },
  golden: {
    hdr: './hdr/golden.hdr',
    sunPos: [-85, 26, 30],
    sunColor: '#ffb672',
    sunIntensity: 3.6,
    envIntensity: 0.6,
    bgIntensity: 1.6,
    bgBlur: 0.2,
    exposure: 0.85,
    fog: '#e6c3a3',
    fogNear: 90,
    fogFar: 380,
    night: 0.35,
    bloom: 0.45,
    saturation: 0.16,
    contrast: 0.1,
  },
  night: {
    hdr: './hdr/night.hdr',
    sunPos: [40, 60, 30],
    sunColor: '#8fa6ff',
    sunIntensity: 0.32,
    envIntensity: 0.22,
    bgIntensity: 0.9,
    bgBlur: 0.1,
    exposure: 1.05,
    fog: '#0c1222',
    fogNear: 70,
    fogFar: 330,
    night: 1,
    bloom: 0.95,
    saturation: 0.1,
    contrast: 0.12,
  },
}

export const preset = () => PRESETS[useUi.getState().tod]
export const nightFactor = () => preset().night
