// Appels en direct aux API publiques (toutes ouvertes, sans clé, CORS autorisé).
// Chaque appel a un délai maximum et un repli hors ligne pour le salon.

export interface Geo {
  label: string
  lon: number
  lat: number
}
export interface DpeRow {
  numero: string
  etiquette: string
  date: string
  validite: string
  surface?: number
  etage?: string
  conso?: number
  chauffage?: string
  adresse: string
}
export interface DpeResult {
  total: number
  dist: Record<string, number>
  rows: DpeRow[]
}
export interface IrlPoint {
  period: string
  value: number
  jo: string
}

async function getJson(url: string, ms = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

/** Géoplateforme IGN (ex-API Adresse / BAN) */
export async function geocode(q: string): Promise<Geo> {
  const j = await getJson(`https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&limit=1`)
  const f = j.features?.[0]
  if (!f) throw new Error('Adresse introuvable')
  return { label: f.properties.label, lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }
}

const DPE_API = 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant'

/** Observatoire DPE de l'ADEME : DPE enregistrés autour d'un point */
export async function dpeAround(g: Geo, radius = 30): Promise<DpeResult> {
  const geo = `geo_distance=${g.lon},${g.lat},${radius}`
  const fields = 'numero_dpe,etiquette_dpe,date_etablissement_dpe,date_fin_validite_dpe,surface_habitable_logement,complement_adresse_logement,conso_5_usages_par_m2_ep,type_energie_principale_chauffage,adresse_ban'
  const [agg, lines] = await Promise.all([
    getJson(`${DPE_API}/values_agg?field=etiquette_dpe&${geo}`),
    getJson(`${DPE_API}/lines?size=8&${geo}&sort=-date_etablissement_dpe&select=${fields}`),
  ])
  const dist: Record<string, number> = {}
  for (const a of agg.aggs ?? []) dist[a.value] = a.total
  return {
    total: agg.total ?? 0,
    dist,
    rows: (lines.results ?? []).map((r: Record<string, string | number>) => ({
      numero: String(r.numero_dpe),
      etiquette: String(r.etiquette_dpe),
      date: String(r.date_etablissement_dpe),
      validite: String(r.date_fin_validite_dpe ?? ''),
      surface: r.surface_habitable_logement as number,
      etage: r.complement_adresse_logement as string,
      conso: r.conso_5_usages_par_m2_ep as number,
      chauffage: r.type_energie_principale_chauffage as string,
      adresse: String(r.adresse_ban),
    })),
  }
}

/** Géorisques (BRGM / ministère) : risques recensés sur la commune */
export async function risks(g: Geo): Promise<string[]> {
  const j = await getJson(`https://www.georisques.gouv.fr/api/v1/gaspar/risques?latlon=${g.lon},${g.lat}&rayon=1000`)
  const det = j.data?.[0]?.risques_detail ?? []
  const main = det.filter((d: { num_risque: string }) => d.num_risque.length <= 2)
  return [...new Set<string>(main.map((d: { libelle_risque_long: string }) => d.libelle_risque_long))]
}

/** INSEE : série BDM 001515333 (Indice de référence des loyers) */
export async function irlSeries(n = 5): Promise<IrlPoint[]> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const r = await fetch(`https://api.insee.fr/series/BDM/V1/data/SERIES_BDM/001515333?lastNObservations=${n}`, { signal: ctrl.signal })
    const xml = new DOMParser().parseFromString(await r.text(), 'application/xml')
    return [...xml.getElementsByTagName('Obs')].map((o) => ({
      period: o.getAttribute('TIME_PERIOD') ?? '',
      value: Number(o.getAttribute('OBS_VALUE')),
      jo: o.getAttribute('DATE_JO') ?? '',
    }))
  } finally {
    clearTimeout(t)
  }
}

// ── Repli hors ligne (données réelles relevées le 01/11/2026) ──
export const OFFLINE_SAMPLE = {
  geo: { label: '12 Rue Vauban 69006 Lyon', lon: 4.843174, lat: 45.764794 },
  dpe: {
    total: 41,
    dist: { C: 2, D: 25, E: 12, F: 1, G: 1 },
    rows: [
      { numero: '2669E2368070M', etiquette: 'D', date: '2026-09-16', validite: '2036-09-15', surface: 36.7, etage: '1er étage', conso: 238, chauffage: 'Électricité', adresse: '15 Rue Vauban 69006 Lyon' },
      { numero: '2669E1830893V', etiquette: 'D', date: '2026-07-07', validite: '2036-07-06', surface: 48.9, etage: 'Étage 3', conso: 189, chauffage: 'Électricité', adresse: '15 Rue Vauban 69006 Lyon' },
      { numero: '2669E0524903L', etiquette: 'D', date: '2026-02-23', validite: '2036-02-22', surface: 32, etage: '5e étage', conso: 193, chauffage: 'Électricité', adresse: '9 Rue Vauban 69006 Lyon' },
      { numero: '2669E0429372E', etiquette: 'E', date: '2026-02-13', validite: '2036-02-12', surface: 50, etage: '2e étage', conso: 275, chauffage: 'Électricité', adresse: '9 Rue Vauban 69006 Lyon' },
    ],
  } as DpeResult,
  risks: ['Inondation', 'Séisme', 'Phénomène lié à l’atmosphère', 'Radon', 'Risque industriel', 'Rupture de barrage', 'Transport de marchandises dangereuses'],
  irl: [
    { period: '2026-Q3', value: 148.06, jo: '2026-10-16' },
    { period: '2026-Q2', value: 148.37, jo: '2026-07-12' },
    { period: '2026-Q1', value: 146.6, jo: '2026-04-16' },
    { period: '2025-Q4', value: 145.78, jo: '2026-01-16' },
    { period: '2025-Q3', value: 145.77, jo: '2025-10-16' },
  ] as IrlPoint[],
}
