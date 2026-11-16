// Index des modèles disponibles (généré par scripts/index-models.mjs → public/models/index.json)

export interface ModelInfo {
  file: string // chemin sans extension, ex. « cars/peugeot-208 »
  size?: [number, number, number] // largeur (X), hauteur (Y), profondeur (Z) en mètres
  clips?: string[]
  tags?: string[]
  credit?: string
}

export interface ModelIndex {
  cars: ModelInfo[]
  people: ModelInfo[]
  buildings: ModelInfo[]
  props: ModelInfo[]
}

export let MODELS: ModelIndex = { cars: [], people: [], buildings: [], props: [] }

export async function loadIndex() {
  try {
    const r = await fetch('./models/index.json', { cache: 'no-cache' })
    if (r.ok) MODELS = await r.json()
  } catch {
    // pas d'index : la scène se rabat sur des volumes simples
  }
}

const all = () => [...MODELS.cars, ...MODELS.people, ...MODELS.buildings, ...MODELS.props]
export const hasModel = (file: string) => all().some((m) => m.file === file)
export const modelInfo = (file: string) => all().find((m) => m.file === file)
export const modelUrl = (file: string) => `./models/${file}.glb`
