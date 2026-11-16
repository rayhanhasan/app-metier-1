// Génère public/models/index.json : fichiers disponibles, dimensions réelles, clips, étiquettes, crédits.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { getBounds } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'

const root = new URL('../public/models/', import.meta.url).pathname
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() })
const out = {}
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

for (const cat of ['cars', 'people', 'buildings', 'props']) {
  const dir = join(root, cat)
  out[cat] = []
  if (!existsSync(dir)) continue
  let manifest = null
  try { manifest = JSON.parse(readFileSync(join(dir, '_manifest.json'), 'utf8')) } catch {}
  // le manifeste peut être un tableau, un objet { files: [...] } ou un objet indexé par nom de fichier
  const entries = !manifest ? [] : Array.isArray(manifest) ? manifest : Array.isArray(manifest.files) ? manifest.files : Array.isArray(manifest.fichiers) ? manifest.fichiers : Array.isArray(manifest.models) ? manifest.models : manifest.models && typeof manifest.models === 'object' ? Object.values(manifest.models) : Array.isArray(manifest.items) ? manifest.items : Object.entries(manifest).map(([k, v]) => (v && typeof v === 'object' ? { file: k, ...v } : null)).filter(Boolean)
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.glb')).sort()) {
    const name = f.replace(/\.glb$/, '')
    const info = { file: `${cat}/${name}` }
    try {
      const doc = await io.read(join(dir, f))
      const b = getBounds(doc.getRoot().listScenes()[0])
      info.size = [0, 1, 2].map((i) => +(b.max[i] - b.min[i]).toFixed(2))
      info.min = b.min.map((v) => +v.toFixed(2))
      const clips = doc.getRoot().listAnimations().map((a) => a.getName())
      if (clips.length) info.clips = clips
      info.nodes = doc.getRoot().listNodes().map((n) => n.getName()).filter((n) => /^wheel_|^body$/.test(n))
      info.materials = [...new Set(doc.getRoot().listMaterials().map((m) => m.getName()))].slice(0, 14)
    } catch (e) { info.error = String(e).slice(0, 120) }
    const entry = entries.find((e) => { const s = norm(JSON.stringify([e.file, e.name, e.filename, e.id, e.fichier, e.nom].filter(Boolean))); return s.includes(`"${norm(name)}"`) || s.includes(`${norm(name)}.glb`) })
    if (entry) {
      const text = norm(JSON.stringify(entry))
      const tags = []
      if (/monument|eglise|church|cathedral|mairie|town hall|chapel/.test(text)) tags.push('monument')
      if (/cafe|brasserie|bistro|restaurant/.test(text)) tags.push('cafe')
      if (/boulangerie|bakery|pharmac|tabac|shop|commerce|boutique|store/.test(text)) tags.push('shop')
      if (tags.length) info.tags = tags
      const c = entry.credit ?? entry.credits ?? entry.source ?? entry['crédit'] ?? entry.credit_ligne
      if (c) info.credit = typeof c === 'string' ? c : [c.title ?? c.titre, c.author ?? c.auteur, c.license ?? c.licence, c.url].filter(Boolean).join(' · ')
    }
    out[cat].push(info)
  }
}
writeFileSync(join(root, 'index.json'), JSON.stringify(out, null, 1))
for (const [k, v] of Object.entries(out)) console.log(k, v.length, v.map((m) => `${m.file.split('/')[1]}${m.size ? ' ' + m.size.join('×') : ''}${m.error ? ' ERR' : ''}`).join(' | ').slice(0, 900))
