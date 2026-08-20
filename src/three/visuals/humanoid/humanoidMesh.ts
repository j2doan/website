import { HUMANOID_SCALE } from './humanoid'
import type { HumanoidData } from './humanoid'
import malebodyObj from '../../../assets/malebody.obj?raw'

// OBJ-derived humanoid.
//
// The base mesh (malebody.obj) is used ONLY as anatomical reference geometry.
// It is parsed into a triangle soup, sampled as a point cloud, and fed into the
// exact same particle system as the procedural humanoid. The mesh is never
// rendered directly, and no textures/materials are applied.
//
// Sampling layers:
//   1. surface          - exact surface points, crisp external silhouette
//   2. shell            - surface points nudged outward, gives the body volume
//   3. inside           - surface points pushed inward, limited depth
// The head region is masked off the skull so head tracking can rotate it.

// Target bounding box in UNSCALED units - matches the procedural figure
// (humanoid.ts: feet near -0.97, crown near 1.36) so HUMANOID_SCALE and all
// camera framing stay identical to the previous figure.
const FEET_Y = -0.97
const CROWN_Y = 1.36

// Surface sampling split (same shares as the procedural pipeline).
const HEAD_SHARE = 0.06
const SHELL_SHARE = 0.4

// Head region mask (unscaled units): skull only, above the neck, centered.
const HEAD_MIN_Y = 1.07
const HEAD_MAX_ABS_X = 0.18
const HEAD_MAX_ABS_Z = 0.3

// Shell halo: surface points pushed slightly outward to thicken the silhouette.
const SHELL_OFFSET_MIN = 0.004
const SHELL_OFFSET_MAX = 0.012

// Interior depth: surface points pushed inward (a thick shell, never a solid
// core, so the interior never overpowers the silhouette).
const INNER_DEPTH_MIN = 0.015
const INNER_DEPTH_MAX = 0.045

interface ParsedBody {
  pos: Float32Array
  nrm: Float32Array
  triCount: number
}

let cachedBody: ParsedBody | null = null

function parseObj(source: string): ParsedBody {
  const lines = source.split(/\r?\n/)
  const verts: number[] = []
  const tris: number[] = []

  for (let li = 0; li < lines.length; li++) {
    const t = lines[li].trim()
    if (!t || t.startsWith('#')) continue
    const token = t.charAt(0)
    if (token === 'v') {
      const p = t.split(/\s+/)
      if (p[0] === 'v' && p.length >= 4) verts.push(+p[1], +p[2], +p[3])
    } else if (token === 'f') {
      const p = t.split(/\s+/)
      const idx: number[] = []
      for (let i = 1; i < p.length; i++) {
        const a = Math.abs(parseInt(p[i], 10)) - 1
        if (a >= 0 && a * 3 + 2 < verts.length) idx.push(a)
      }
      if (idx.length === 3) tris.push(idx[0], idx[1], idx[2])
      else if (idx.length === 4) tris.push(idx[0], idx[1], idx[2], idx[0], idx[2], idx[3])
    }
  }

  const triCount = tris.length / 3
  const pos = new Float32Array(tris.length * 3)

  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity

  for (let i = 0; i < tris.length; i++) {
    const x = verts[tris[i] * 3]
    const y = verts[tris[i] * 3 + 1]
    const z = verts[tris[i] * 3 + 2]
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }

  // Normalize so the feet sit at FEET_Y, the crown at CROWN_Y, x/z centered.
  const scale = (CROWN_Y - FEET_Y) / (maxY - minY)
  const tx = -((minX + maxX) / 2) * scale
  const ty = CROWN_Y - maxY * scale
  const tz = -((minZ + maxZ) / 2) * scale
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = pos[i] * scale + tx
    pos[i + 1] = pos[i + 1] * scale + ty
    pos[i + 2] = pos[i + 2] * scale + tz
  }

  // Outward-corrected per-vertex face normals: any face normal pointing back
  // toward the mesh centroid is flipped so shell/interior offsets always push
  // out of / into the body regardless of winding.
  const nrm = new Float32Array(tris.length * 3)
  const vertexCount = pos.length / 3
  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < pos.length; i += 3) {
    cx += pos[i]
    cy += pos[i + 1]
    cz += pos[i + 2]
  }
  cx /= vertexCount
  cy /= vertexCount
  cz /= vertexCount

  for (let t = 0; t < triCount; t++) {
    const i0 = t * 9
    const i1 = i0 + 3
    const i2 = i0 + 6
    const abx = pos[i1] - pos[i0]
    const aby = pos[i1 + 1] - pos[i0 + 1]
    const abz = pos[i1 + 2] - pos[i0 + 2]
    const acx = pos[i2] - pos[i0]
    const acy = pos[i2 + 1] - pos[i0 + 1]
    const acz = pos[i2 + 2] - pos[i0 + 2]
    let nx = aby * acz - abz * acy
    let ny = abz * acx - abx * acz
    let nz = abx * acy - aby * acx
    const len = Math.hypot(nx, ny, nz) || 1
    nx /= len
    ny /= len
    nz /= len
    if (nx * (pos[i0] - cx) + ny * (pos[i0 + 1] - cy) + nz * (pos[i0 + 2] - cz) < 0) {
      nx = -nx
      ny = -ny
      nz = -nz
    }
    for (let k = 0; k < 3; k++) {
      nrm[(t * 3 + k) * 3] = nx
      nrm[(t * 3 + k) * 3 + 1] = ny
      nrm[(t * 3 + k) * 3 + 2] = nz
    }
  }

  return { pos, nrm, triCount }
}

function getBody(): ParsedBody {
  if (!cachedBody) cachedBody = parseObj(malebodyObj)
  return cachedBody
}

function sampleSurface(
  body: ParsedBody,
  count: number,
): { pts: Float32Array; nrm: Float32Array } {
  const areas = new Float32Array(body.triCount)
  let total = 0
  for (let t = 0; t < body.triCount; t++) {
    const i0 = t * 9
    const abx = body.pos[i0 + 3] - body.pos[i0]
    const aby = body.pos[i0 + 4] - body.pos[i0 + 1]
    const abz = body.pos[i0 + 5] - body.pos[i0 + 2]
    const acx = body.pos[i0 + 6] - body.pos[i0]
    const acy = body.pos[i0 + 7] - body.pos[i0 + 1]
    const acz = body.pos[i0 + 8] - body.pos[i0 + 2]
    total += Math.hypot(aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx) / 2
    areas[t] = total
  }

  const pts = new Float32Array(count * 3)
  const nrm = new Float32Array(count * 3)

  for (let s = 0; s < count; s++) {
    const r = Math.random() * total
    let lo = 0
    let hi = body.triCount - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (areas[mid] < r) lo = mid + 1
      else hi = mid
    }
    const i0 = lo * 9
    let u = Math.random()
    let v = Math.random()
    if (u + v > 1) {
      u = 1 - u
      v = 1 - v
    }
    const w = 1 - u - v
    pts[s * 3] = body.pos[i0] * w + body.pos[i0 + 3] * u + body.pos[i0 + 6] * v
    pts[s * 3 + 1] = body.pos[i0 + 1] * w + body.pos[i0 + 4] * u + body.pos[i0 + 7] * v
    pts[s * 3 + 2] = body.pos[i0 + 2] * w + body.pos[i0 + 5] * u + body.pos[i0 + 8] * v
    nrm[s * 3] = body.nrm[i0]
    nrm[s * 3 + 1] = body.nrm[i0 + 1]
    nrm[s * 3 + 2] = body.nrm[i0 + 2]
  }

  return { pts, nrm }
}

export function buildHumanoidMeshData(count: number, innerCount: number): HumanoidData {
  const body = getBody()
  const surface = sampleSurface(body, Math.max(1, count))

  const headAlloc = Math.max(1, Math.min(Math.floor(count * HEAD_SHARE), count))
  const shellAlloc = Math.max(0, Math.floor(count * SHELL_SHARE))
  const bodyAlloc = Math.max(0, count - headAlloc - shellAlloc)

  const head = new Float32Array(headAlloc * 3)
  const shell = new Float32Array(shellAlloc * 3)
  const bodyPts = new Float32Array(bodyAlloc * 3)

  const isHead = (i: number) => {
    if (surface.pts[i * 3 + 1] < HEAD_MIN_Y) return false
    return (
      Math.abs(surface.pts[i * 3]) <= HEAD_MAX_ABS_X &&
      Math.abs(surface.pts[i * 3 + 2]) <= HEAD_MAX_ABS_Z
    )
  }

  const taken = new Uint8Array(count)

  let hi = 0
  for (let i = 0; i < count && hi < headAlloc; i++) {
    if (!isHead(i)) continue
    head[hi * 3] = surface.pts[i * 3]
    head[hi * 3 + 1] = surface.pts[i * 3 + 1]
    head[hi * 3 + 2] = surface.pts[i * 3 + 2]
    taken[i] = 1
    hi++
  }
  // If the head mask under-fills, pad from the head pool itself (never stray
  // torso points) so the rotating head cloud stays self-contained.
  if (hi === 0) {
    head[0] = surface.pts[0]
    head[1] = surface.pts[1]
    head[2] = surface.pts[2]
    hi = 1
  }
  while (hi < headAlloc) {
    const k = hi % Math.max(1, hi)
    head[hi * 3] = head[k * 3]
    head[hi * 3 + 1] = head[k * 3 + 1]
    head[hi * 3 + 2] = head[k * 3 + 2]
    hi++
  }

  let si = 0
  let bi = 0
  for (let i = 0; i < count; i++) {
    if (taken[i]) continue
    if (si < shellAlloc) {
      const offset = SHELL_OFFSET_MIN + (SHELL_OFFSET_MAX - SHELL_OFFSET_MIN) * Math.random()
      shell[si * 3] = surface.pts[i * 3] + surface.nrm[i * 3] * offset
      shell[si * 3 + 1] = surface.pts[i * 3 + 1] + surface.nrm[i * 3 + 1] * offset
      shell[si * 3 + 2] = surface.pts[i * 3 + 2] + surface.nrm[i * 3 + 2] * offset
      si++
    } else {
      bodyPts[bi * 3] = surface.pts[i * 3]
      bodyPts[bi * 3 + 1] = surface.pts[i * 3 + 1]
      bodyPts[bi * 3 + 2] = surface.pts[i * 3 + 2]
      bi++
    }
  }

  const inside = new Float32Array(Math.max(0, innerCount) * 3)
  if (innerCount > 0) {
    const inner = sampleSurface(body, innerCount)
    for (let i = 0; i < innerCount; i++) {
      const depth = INNER_DEPTH_MIN + (INNER_DEPTH_MAX - INNER_DEPTH_MIN) * Math.random()
      inside[i * 3] = inner.pts[i * 3] - inner.nrm[i * 3] * depth
      inside[i * 3 + 1] = inner.pts[i * 3 + 1] - inner.nrm[i * 3 + 1] * depth
      inside[i * 3 + 2] = inner.pts[i * 3 + 2] - inner.nrm[i * 3 + 2] * depth
    }
  }

  const scale = (a: Float32Array) => {
    for (let i = 0; i < a.length; i++) a[i] *= HUMANOID_SCALE
    return a
  }

  return {
    body: scale(bodyPts),
    shell: scale(shell),
    head: scale(head),
    inside: scale(inside),
  }
}
