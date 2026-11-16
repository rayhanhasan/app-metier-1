// Trajectoires au sol (plan X/Z, en mètres), rééchantillonnées à pas constant.
// Cap θ : l'avant pointe vers (sin θ, cos θ) ; θ croissant = virage à gauche.

export type P2 = [number, number]

export interface Path {
  xs: Float32Array
  zs: Float32Array
  hs: Float32Array // cap déroulé (rad)
  ks: Float32Array // courbure (1/m), > 0 à gauche
  ds: number
  total: number
  closed: boolean
}

export interface Pose {
  x: number
  z: number
  heading: number
  curv: number
}

function resample(raw: P2[], closed: boolean, ds: number): Path {
  const pts = closed ? [...raw, raw[0]] : raw
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = cum[cum.length - 1]
  const n = Math.max(2, Math.floor(total / ds) + 1)
  const step = closed ? total / n : total / (n - 1)
  const xs = new Float32Array(n)
  const zs = new Float32Array(n)
  let j = 0
  for (let i = 0; i < n; i++) {
    const s = Math.min(total, i * step)
    while (j < cum.length - 2 && cum[j + 1] < s) j++
    const t = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j])
    xs[i] = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t
    zs[i] = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t
  }
  const hs = new Float32Array(n)
  const ks = new Float32Array(n)
  const at = (i: number) => (closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i)))
  let prev = 0
  for (let i = 0; i < n; i++) {
    const a = at(i - 1)
    const b = at(i + 1)
    let h = Math.atan2(xs[b] - xs[a], zs[b] - zs[a])
    if (i > 0) {
      while (h - prev > Math.PI) h -= 2 * Math.PI
      while (h - prev < -Math.PI) h += 2 * Math.PI
    }
    hs[i] = h
    prev = h
  }
  for (let i = 0; i < n; i++) {
    const a = at(i - 2)
    const b = at(i + 2)
    let dh = hs[b] - hs[a]
    if (closed) {
      while (dh > Math.PI) dh -= 2 * Math.PI
      while (dh < -Math.PI) dh += 2 * Math.PI
    }
    const span = closed ? 4 * step : Math.max(1, b - a) * step
    ks[i] = dh / span
  }
  return { xs, zs, hs, ks, ds: step, total, closed }
}

/** Courbe lisse passant par les points (Catmull-Rom centripète). */
export function smoothPath(points: P2[], closed = false, ds = 0.2): Path {
  const n = points.length
  const get = (i: number): P2 => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))])
  const raw: P2[] = []
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1)
    const p1 = get(i)
    const p2 = get(i + 1)
    const p3 = get(i + 2)
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    const sub = Math.max(2, Math.ceil(len / 0.25))
    for (let k = 0; k < sub; k++) {
      const t = k / sub
      const t2 = t * t
      const t3 = t2 * t
      raw.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ])
    }
  }
  if (!closed) raw.push(points[n - 1])
  return resample(raw, closed, ds)
}

/** Segments droits raccordés par des arcs de cercle de rayon donné. */
export function filletPath(points: P2[], radius: number, closed = false, ds = 0.2): Path {
  const n = points.length
  const raw: P2[] = []
  const idx = (i: number) => (i + n) % n
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const isEnd = !closed && (i === 0 || i === n - 1)
    if (isEnd) {
      raw.push(p)
      continue
    }
    const a = points[idx(i - 1)]
    const b = points[idx(i + 1)]
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1])
    const l2 = Math.hypot(b[0] - p[0], b[1] - p[1])
    const d1: P2 = [(p[0] - a[0]) / l1, (p[1] - a[1]) / l1]
    const d2: P2 = [(b[0] - p[0]) / l2, (b[1] - p[1]) / l2]
    const cos = Math.max(-1, Math.min(1, d1[0] * d2[0] + d1[1] * d2[1]))
    const phi = Math.acos(cos)
    if (phi < 0.02) {
      raw.push(p)
      continue
    }
    const t = Math.min(radius * Math.tan(phi / 2), l1 * 0.49, l2 * 0.49)
    const r = t / Math.tan(phi / 2)
    const start: P2 = [p[0] - d1[0] * t, p[1] - d1[1] * t]
    const cross = d1[0] * d2[1] - d1[1] * d2[0]
    const side = cross > 0 ? 1 : -1
    // normale à d1, du côté du virage
    const nx = -d1[1] * side
    const nz = d1[0] * side
    const cx = start[0] + nx * r
    const cz = start[1] + nz * r
    const a0 = Math.atan2(start[1] - cz, start[0] - cx)
    const steps = Math.max(3, Math.ceil((phi * r) / 0.2))
    for (let k = 0; k <= steps; k++) {
      const ang = a0 + side * phi * (k / steps)
      raw.push([cx + Math.cos(ang) * r, cz + Math.sin(ang) * r])
    }
  }
  return resample(raw, closed, ds)
}

export function sample(p: Path, s: number, out: Pose): Pose {
  const n = p.xs.length
  let u = s / p.ds
  if (p.closed) {
    u = ((u % n) + n) % n
    const i = Math.floor(u)
    const j = (i + 1) % n
    const t = u - i
    out.x = p.xs[i] + (p.xs[j] - p.xs[i]) * t
    out.z = p.zs[i] + (p.zs[j] - p.zs[i]) * t
    let dh = p.hs[j] - p.hs[i]
    while (dh > Math.PI) dh -= 2 * Math.PI
    while (dh < -Math.PI) dh += 2 * Math.PI
    out.heading = p.hs[i] + dh * t
    out.curv = p.ks[i] + (p.ks[j] - p.ks[i]) * t
  } else {
    u = Math.max(0, Math.min(n - 1.0001, u))
    const i = Math.floor(u)
    const t = u - i
    out.x = p.xs[i] + (p.xs[i + 1] - p.xs[i]) * t
    out.z = p.zs[i] + (p.zs[i + 1] - p.zs[i]) * t
    out.heading = p.hs[i] + (p.hs[i + 1] - p.hs[i]) * t
    out.curv = p.ks[i] + (p.ks[i + 1] - p.ks[i]) * t
  }
  return out
}

/** Abscisse curviligne du point de la trajectoire le plus proche de (x, z). */
export function nearestS(p: Path, x: number, z: number): number {
  let best = 0
  let bd = Infinity
  for (let i = 0; i < p.xs.length; i++) {
    const d = (p.xs[i] - x) ** 2 + (p.zs[i] - z) ** 2
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return best * p.ds
}

/** Plus grande courbure (en valeur absolue) entre s et s + dist. */
export function maxCurvAhead(p: Path, s: number, dist: number): number {
  const n = p.xs.length
  const i0 = Math.floor(s / p.ds)
  const steps = Math.ceil(dist / p.ds)
  let m = 0
  for (let k = 0; k <= steps; k += 2) {
    let i = i0 + k
    if (p.closed) i = ((i % n) + n) % n
    else if (i >= n) break
    const c = Math.abs(p.ks[i])
    if (c > m) m = c
  }
  return m
}
