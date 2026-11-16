import * as THREE from 'three'

// Géométries horizontales avec UV en coordonnées monde (1 unité UV = 1 m).

export type V2 = [number, number]

/** Polygone horizontal (points en X/Z monde) posé à la hauteur y. */
export function polygon(points: V2[], y = 0, holes: V2[][] = []): THREE.BufferGeometry {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)))
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))))
  const g = new THREE.ShapeGeometry(shape, 24)
  g.rotateX(-Math.PI / 2)
  g.translate(0, y, 0)
  return g
}

export function rect(x0: number, x1: number, z0: number, z1: number, y = 0): THREE.BufferGeometry {
  return polygon(
    [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ],
    y,
  )
}

export function disc(cx: number, cz: number, r: number, y = 0, segments = 72): THREE.BufferGeometry {
  const pts: V2[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r])
  }
  return polygon(pts, y)
}

export function arcPoints(cx: number, cz: number, r: number, fromDeg: number, toDeg: number, step = 4): V2[] {
  const pts: V2[] = []
  const n = Math.max(2, Math.ceil(Math.abs(toDeg - fromDeg) / step))
  for (let i = 0; i <= n; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / n) * Math.PI) / 180
    pts.push([cx + Math.cos(a) * r, cz - Math.sin(a) * r]) // angle positif vers le nord
  }
  return pts
}

/** Ensemble de rectangles au sol fusionnés en une seule géométrie (marquages). */
export function quads(list: { x: number; z: number; w: number; d: number; rot?: number }[], y: number): THREE.BufferGeometry {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  list.forEach((q, i) => {
    const c = Math.cos(q.rot ?? 0)
    const s = Math.sin(q.rot ?? 0)
    const hw = q.w / 2
    const hd = q.d / 2
    const corners: V2[] = [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd],
    ]
    for (const [lx, lz] of corners) {
      pos.push(q.x + lx * c + lz * s, y, q.z - lx * s + lz * c)
      uv.push(lx / q.w + 0.5, lz / q.d + 0.5)
    }
    idx.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4, i * 4 + 3, i * 4 + 2)
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Bordure verticale le long d'une polyligne (arêtes de trottoir, murets). */
export function wallAlong(points: V2[], y0: number, y1: number, closed = false): THREE.BufferGeometry {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const pts = closed ? [...points, points[0]] : points
  let u = 0
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) u += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    pos.push(pts[i][0], y0, pts[i][1], pts[i][0], y1, pts[i][1])
    uv.push(u, y0, u, y1)
    if (i > 0) {
      const a = (i - 1) * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Boîte dont les UV suivent les dimensions réelles (1 unité UV = 1 m), pour plaquer une texture sans étirement. */
export function worldBox(w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  const pos = g.attributes.position
  const nor = g.attributes.normal
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i))
    const ny = Math.abs(nor.getY(i))
    if (nx > 0.5) uv.setXY(i, pos.getZ(i), pos.getY(i))
    else if (ny > 0.5) uv.setXY(i, pos.getX(i), pos.getZ(i))
    else uv.setXY(i, pos.getX(i), pos.getY(i))
  }
  uv.needsUpdate = true
  return g
}
