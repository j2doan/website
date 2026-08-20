import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

interface PartDef {
  build: () => THREE.BufferGeometry
  x: number
  y: number
  z: number
  weight: number
  kind: 'sphere' | 'capsule' | 'torso'
  radius: number
  length: number
  profile?: Array<[number, number]>
}

// Torso profile (radius, height) from hip to shoulder line.
const TORSO_PROFILE: Array<[number, number]> = [
  [0.26, 0.42],
  [0.27, 0.5],
  [0.23, 0.62],
  [0.19, 0.66],
  [0.24, 0.78],
  [0.3, 0.88],
  [0.32, 0.96],
]

// Stylized mannequin proportions: tapered torso with a narrow waist
// and broad shoulders, slim limbs with natural joint overlaps, longer legs and
// a smaller head. Unscaled units; HUMANOID_SCALE applied at the end. Feet sit
// near y = -0.97 and the head crown near y = 1.36, matching the previous
// figure's world-space bounding box so the camera framing is unchanged.
const PART_DEFS: PartDef[] = [
  // head (small) + neck
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.16, 20, 16), x: 0, y: 1.2, z: 0, weight: 1, radius: 0.16, length: 0 },
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.055, 0.12, 5, 10), x: 0, y: 1.03, z: 0, weight: 1, radius: 0.055, length: 0.12 },
  // deltoids (broad shoulders)
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.125, 16, 12), x: -0.35, y: 0.94, z: 0, weight: 1, radius: 0.125, length: 0 },
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.125, 16, 12), x: 0.35, y: 0.94, z: 0, weight: 1, radius: 0.125, length: 0 },
  // torso: lathe of revolution, hip -> waist -> chest -> shoulders
  {
    kind: 'torso',
    build: () => {
      const profile = TORSO_PROFILE.map(([r, y]) => new THREE.Vector2(r, y))
      return new THREE.LatheGeometry(profile, 24)
    },
    x: 0,
    y: 0,
    z: 0,
    weight: 1,
    radius: 0,
    length: 0,
    profile: TORSO_PROFILE,
  },
  // upper arms
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.07, 0.36, 5, 10), x: -0.37, y: 0.69, z: 0, weight: 1, radius: 0.07, length: 0.36 },
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.07, 0.36, 5, 10), x: 0.37, y: 0.69, z: 0, weight: 1, radius: 0.07, length: 0.36 },
  // forearms
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.06, 0.36, 5, 10), x: -0.38, y: 0.27, z: 0, weight: 1, radius: 0.06, length: 0.36 },
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.06, 0.36, 5, 10), x: 0.38, y: 0.27, z: 0, weight: 1, radius: 0.06, length: 0.36 },
  // hands
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.06, 12, 10), x: -0.385, y: 0.02, z: 0, weight: 1, radius: 0.06, length: 0 },
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.06, 12, 10), x: 0.385, y: 0.02, z: 0, weight: 1, radius: 0.06, length: 0 },
  // thighs (longer legs)
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.115, 0.5, 5, 10), x: -0.155, y: 0.12, z: 0, weight: 1, radius: 0.115, length: 0.5 },
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.115, 0.5, 5, 10), x: 0.155, y: 0.12, z: 0, weight: 1, radius: 0.115, length: 0.5 },
  // lower legs
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.085, 0.5, 5, 10), x: -0.14, y: -0.47, z: 0, weight: 1, radius: 0.085, length: 0.5 },
  { kind: 'capsule', build: () => new THREE.CapsuleGeometry(0.085, 0.5, 5, 10), x: 0.14, y: -0.47, z: 0, weight: 1, radius: 0.085, length: 0.5 },
  // feet
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.09, 14, 12), x: -0.15, y: -0.88, z: 0.03, weight: 1, radius: 0.09, length: 0 },
  { kind: 'sphere', build: () => new THREE.SphereGeometry(0.09, 14, 12), x: 0.15, y: -0.88, z: 0.03, weight: 1, radius: 0.09, length: 0 },
]

// Fraction of surface samples that fall inside the head region (y >= 1.02,
// near the vertical axis). Slightly under the geometry's natural head+neck
// share so the head cloud is never topped up with arbitrary body points.
const HEAD_SHARE = 0.08

// Fraction of surface samples reserved for the dedicated crisp outline shell.
const SHELL_SHARE = 0.4

function partVolume(def: PartDef): number {
  const sphere = (4 / 3) * Math.PI * def.radius ** 3
  if (def.kind === 'capsule') return Math.PI * def.radius ** 2 * def.length + sphere
  if (def.kind === 'torso') {
    const profile = def.profile!
    let vol = 0
    for (let i = 0; i < profile.length - 1; i++) {
      const [r0, y0] = profile[i]
      const [r1, y1] = profile[i + 1]
      const dy = y1 - y0
      vol += (Math.PI / 3) * dy * (r0 * r0 + r0 * r1 + r1 * r1)
    }
    return vol
  }
  return sphere
}

function distributeCounts(sizes: number[], count: number): number[] {
  const total = sizes.reduce((acc, v) => acc + v, 0)
  const counts = sizes.map((s) => Math.floor((count * s) / total))
  const fractions = sizes.map((s, i) => (count * s) / total - counts[i])
  let remainder = count - counts.reduce((acc, v) => acc + v, 0)
  const order = sizes
    .map((_, i) => i)
    .sort((a, b) => fractions[b] - fractions[a])
  let o = 0
  while (remainder > 0) {
    counts[order[o % order.length]]++
    o++
    remainder--
  }
  return counts
}

function buildParts(): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = []
  for (const def of PART_DEFS) {
    const geometry = def.build()
    geometry.translate(def.x, def.y, def.z)
    parts.push(geometry)
  }
  return parts
}

export function buildHumanoidGeometry(): THREE.BufferGeometry | null {
  const parts = buildParts()
  return mergeGeometries(parts)
}

function geometryArea(geometry: THREE.BufferGeometry): number {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const index = geometry.getIndex()
  const triCount = index ? index.count / 3 : position.count / 3
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()
  let total = 0
  for (let t = 0; t < triCount; t++) {
    const ia = index ? index.getX(t * 3) : t * 3
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2
    a.fromBufferAttribute(position, ia)
    b.fromBufferAttribute(position, ib)
    c.fromBufferAttribute(position, ic)
    ab.subVectors(b, a)
    ac.subVectors(c, a)
    total += ab.cross(ac).length() / 2
  }
  return total
}

export function sampleSurfacePoints(
  geometry: THREE.BufferGeometry,
  count: number,
): Float32Array {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const index = geometry.getIndex()

  let triCount: number
  if (index) triCount = index.count / 3
  else triCount = position.count / 3

  const areas = new Float32Array(triCount)
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()
  let total = 0

  for (let t = 0; t < triCount; t++) {
    const ia = index ? index.getX(t * 3) : t * 3
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2
    a.fromBufferAttribute(position, ia)
    b.fromBufferAttribute(position, ib)
    c.fromBufferAttribute(position, ic)
    ab.subVectors(b, a)
    ac.subVectors(c, a)
    const area = ab.cross(ac).length() / 2
    areas[t] = area
    total += area
  }

  for (let t = 1; t < triCount; t++) areas[t] += areas[t - 1]

  const out = new Float32Array(count * 3)
  for (let s = 0; s < count; s++) {
    const r = Math.random() * total
    let t = 0
    while (t < triCount - 1 && areas[t] < r) t++
    const ia = index ? index.getX(t * 3) : t * 3
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2
    a.fromBufferAttribute(position, ia)
    b.fromBufferAttribute(position, ib)
    c.fromBufferAttribute(position, ic)
    let u = Math.random()
    let v = Math.random()
    if (u + v > 1) {
      u = 1 - u
      v = 1 - v
    }
    const w = 1 - u - v
    out[s * 3] = a.x * w + b.x * u + c.x * v
    out[s * 3 + 1] = a.y * w + b.y * u + c.y * v
    out[s * 3 + 2] = a.z * w + b.z * u + c.z * v
  }
  return out
}

function sampleWeightedSurface(parts: THREE.BufferGeometry[], count: number): Float32Array {
  const eff = parts.map((g, i) => geometryArea(g) * PART_DEFS[i].weight)
  const counts = distributeCounts(eff, count)

  const out = new Float32Array(count * 3)
  let offset = 0
  for (let i = 0; i < parts.length; i++) {
    if (counts[i] <= 0) continue
    const sampled = sampleSurfacePoints(parts[i], counts[i])
    out.set(sampled, offset * 3)
    offset += counts[i]
  }
  return out
}

function sampleInteriorPart(def: PartDef, count: number): Float32Array {
  const out = new Float32Array(count * 3)
  // Interior particles are biased toward the surface so they form a thick
  // shell (roughly the outer 10-25% of each part) rather than a solid core.
  const shellMin = 0.9
  const shellSpan = 0.07
  if (def.kind === 'sphere') {
    for (let i = 0; i < count; i++) {
      const u = shellMin + shellSpan * Math.random()
      const r = def.radius * u
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      out[i * 3] = def.x + r * Math.sin(phi) * Math.cos(theta)
      out[i * 3 + 1] = def.y + r * Math.cos(phi)
      out[i * 3 + 2] = def.z + r * Math.sin(phi) * Math.sin(theta)
    }
  } else if (def.kind === 'torso') {
    const profile = def.profile!
    const yMin = profile[0][1]
    const yMax = profile[profile.length - 1][1]
    const rAt = (yy: number) => {
      if (yy <= yMin) return profile[0][0]
      if (yy >= yMax) return profile[profile.length - 1][0]
      for (let i = 0; i < profile.length - 1; i++) {
        const [r0, y0] = profile[i]
        const [r1, y1] = profile[i + 1]
        if (yy >= y0 && yy <= y1) {
          return r0 + (r1 - r0) * ((yy - y0) / (y1 - y0))
        }
      }
      return 0
    }
    for (let i = 0; i < count; i++) {
      const yy = yMin + Math.random() * (yMax - yMin)
      const rMax = rAt(yy)
      const radial = rMax * (shellMin + shellSpan * Math.random())
      const theta = Math.random() * Math.PI * 2
      out[i * 3] = def.x + radial * Math.cos(theta)
      out[i * 3 + 1] = def.y + yy
      out[i * 3 + 2] = def.z + radial * Math.sin(theta)
    }
  } else {
    const half = def.length / 2
    for (let i = 0; i < count; i++) {
      const dy = (Math.random() * 2 - 1) * (half + def.radius)
      const ady = Math.abs(dy)
      let rMax: number
      if (ady <= half) rMax = def.radius
      else rMax = def.radius * Math.sqrt(1 - ((ady - half) / def.radius) ** 2)
      const radial = rMax * (shellMin + shellSpan * Math.random())
      const theta = Math.random() * Math.PI * 2
      out[i * 3] = def.x + radial * Math.cos(theta)
      out[i * 3 + 1] = def.y + dy
      out[i * 3 + 2] = def.z + radial * Math.sin(theta)
    }
  }
  return out
}

function sampleInteriorVolumes(count: number): Float32Array {
  const volumes = PART_DEFS.map(partVolume)
  const counts = distributeCounts(volumes, count)

  const out = new Float32Array(count * 3)
  let offset = 0
  for (let i = 0; i < PART_DEFS.length; i++) {
    if (counts[i] <= 0) continue
    const sampled = sampleInteriorPart(PART_DEFS[i], counts[i])
    out.set(sampled, offset * 3)
    offset += counts[i]
  }
  return out
}

export interface HumanoidData {
  body: Float32Array
  shell: Float32Array
  head: Float32Array
  inside: Float32Array
}

export const HUMANOID_SCALE = 3.0

function scaleArray(source: Float32Array): Float32Array {
  const out = new Float32Array(source.length)
  for (let i = 0; i < source.length; i++) out[i] = source[i] * HUMANOID_SCALE
  return out
}

export function buildHumanoidData(count: number, innerCount: number): HumanoidData {
  const parts = buildParts()
  const headCount = Math.max(1, Math.floor(count * HEAD_SHARE))
  const shellCount = Math.max(1, Math.floor(count * SHELL_SHARE))
  const bodyCount = Math.max(0, count - headCount - shellCount)
  const empty: HumanoidData = {
    body: new Float32Array(bodyCount * 3),
    shell: new Float32Array(shellCount * 3),
    head: new Float32Array(headCount * 3),
    inside: new Float32Array(innerCount * 3),
  }
  if (parts.length === 0) return empty

  const surface = sampleWeightedSurface(parts, count)
  const head = new Float32Array(headCount * 3)
  const shell = new Float32Array(shellCount * 3)
  const body = new Float32Array(bodyCount * 3)

  let hi = 0
  let si = 0
  let bi = 0

  for (let i = 0; i < count; i++) {
    const x = surface[i * 3]
    const y = surface[i * 3 + 1]
    const z = surface[i * 3 + 2]
    if (
      y >= 1.02 &&
      Math.abs(x) <= 0.2 &&
      Math.abs(z) <= 0.2 &&
      hi < headCount
    ) {
      head[hi * 3] = x
      head[hi * 3 + 1] = y
      head[hi * 3 + 2] = z
      hi++
    } else if (si < shellCount) {
      shell[si * 3] = x
      shell[si * 3 + 1] = y
      shell[si * 3 + 2] = z
      si++
    } else {
      body[bi * 3] = x
      body[bi * 3 + 1] = y
      body[bi * 3 + 2] = z
      bi++
    }
  }

  while (hi < headCount) {
    const k = hi % count
    head[hi * 3] = surface[k * 3]
    head[hi * 3 + 1] = surface[k * 3 + 1]
    head[hi * 3 + 2] = surface[k * 3 + 2]
    hi++
  }
  while (si < shellCount) {
    const k = si % count
    shell[si * 3] = surface[k * 3]
    shell[si * 3 + 1] = surface[k * 3 + 1]
    shell[si * 3 + 2] = surface[k * 3 + 2]
    si++
  }
  while (bi < bodyCount) {
    const k = bi % count
    body[bi * 3] = surface[k * 3]
    body[bi * 3 + 1] = surface[k * 3 + 1]
    body[bi * 3 + 2] = surface[k * 3 + 2]
    bi++
  }

  return {
    body: scaleArray(body),
    shell: scaleArray(shell),
    head: scaleArray(head),
    inside: scaleArray(sampleInteriorVolumes(innerCount)),
  }
}
