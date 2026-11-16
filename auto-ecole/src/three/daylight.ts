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
  /** ciel dégradé : zénith, horizon, intensité */
  skyTop: string
  skyHorizon: string
  skyGain: number
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
    fog: '#cfe0f0',
    fogNear: 110,
    fogFar: 420,
    night: 0,
    skyTop: '#2f74d0',
    skyHorizon: '#cfe4f7',
    skyGain: 1.25,
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
    fog: '#f1c9a2',
    fogNear: 90,
    fogFar: 380,
    night: 0.35,
    skyTop: '#4a6fae',
    skyHorizon: '#ffc590',
    skyGain: 1.2,
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
    fog: '#121c33',
    fogNear: 70,
    fogFar: 330,
    night: 1,
    skyTop: '#050814',
    skyHorizon: '#1b2a4a',
    skyGain: 1,
    bloom: 0.95,
    saturation: 0.1,
    contrast: 0.12,
  },
}

// Réglages fins par URL, pour comparer des rendus sans recompiler : ?sun=3&bg=1.2&exp=0.9&env=0.6
const q = new URLSearchParams(location.search)
const over = (k: string) => (q.has(k) ? Number(q.get(k)) : undefined)
for (const p of Object.values(PRESETS)) {
  p.sunIntensity = over('sun') ?? p.sunIntensity
  p.bgIntensity = over('bg') ?? p.bgIntensity
  p.exposure = over('exp') ?? p.exposure
  p.envIntensity = over('env') ?? p.envIntensity
}

export const preset = () => PRESETS[useUi.getState().tod]
export const nightFactor = () => preset().night
