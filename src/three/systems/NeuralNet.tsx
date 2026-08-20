import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

// ---------------------------------------------------------------------------
// A living network of drifting nodes and links.
//
// A sparse shell of glowing nodes around the stage, linked to their nearest
// neighbours. Nodes and links drift together through the same shader function
// (shared seed) so endpoints never detach. Shader-driven + low counts so it
// stays cheap; fully hidden under Low VFX.
// ---------------------------------------------------------------------------

const DRIFT = /* glsl */ `
vec3 drift(vec3 p, float seed, float t) {
  p += vec3(
    sin(t * 0.14 + seed * 6.28318) * 0.22,
    cos(t * 0.11 + seed * 4.2) * 0.22,
    sin(t * 0.09 + seed * 7.6) * 0.22
  );
  return p;
}
`

const NODE_VERT = /* glsl */ `
${DRIFT}
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
attribute float aTw;
varying float vTw;
varying float vMix;

void main() {
  vec3 p = drift(position, aSeed, uTime);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPixelRatio * (1.8 + 1.4 * aTw) * (90.0 / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
  vTw = aTw;
  vMix = aSeed;
}
`

const NODE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vTw;
varying float vMix;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float a = disc * (0.1 + 0.5 * vTw);
  if (a < 0.004) discard;
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col * a, a);
}
`

const EDGE_VERT = /* glsl */ `
${DRIFT}
uniform float uTime;
attribute float aSeed;
attribute float aTw;
varying float vA;
void main() {
  vec3 p = drift(position, aSeed, uTime);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vA = aTw;
}
`

const EDGE_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main() {
  if (vA < 0.02) discard;
  gl_FragColor = vec4(uColor * (vA * 0.55), vA * 0.5);
}
`

interface Network {
  nodes: THREE.Points
  links: THREE.LineSegments
}

function distSq(a: number, b: number, positions: Float32Array): number {
  const dx = positions[a * 3] - positions[b * 3]
  const dy = positions[a * 3 + 1] - positions[b * 3 + 1]
  const dz = positions[a * 3 + 2] - positions[b * 3 + 2]
  return dx * dx + dy * dy + dz * dz
}

function buildNetwork(count: number, connect: number): Network {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const tws = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 9.5 + Math.random() * 2.5
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.8 + 1.4
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    seeds[i] = Math.random()
    tws[i] = 0.3 + Math.random() * 0.7
  }

  const edgePositions: number[] = []
  const edgeSeeds: number[] = []
  const edgeTws: number[] = []
  const seen = new Set<string>()

  for (let i = 0; i < count; i++) {
    const order: number[] = []
    for (let k = 0; k < count; k++) if (k !== i) order.push(k)
    order.sort((a, b) => distSq(i, a, positions) - distSq(i, b, positions))
    for (let n = 0; n < connect && n < order.length; n++) {
      const key = i < order[n] ? `${i}-${order[n]}` : `${order[n]}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      const a = i
      const b = order[n]
      edgePositions.push(
        positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
        positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2],
      )
      edgeSeeds.push(seeds[a], seeds[b])
      edgeTws.push(tws[a], tws[b])
    }
  }

  const nodeGeom = new THREE.BufferGeometry()
  nodeGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  nodeGeom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  nodeGeom.setAttribute('aTw', new THREE.BufferAttribute(tws, 1))

  const nodeMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorA: { value: new THREE.Color('#5cc8ff') },
      uColorB: { value: new THREE.Color('#9b7bff') },
    },
    vertexShader: NODE_VERT,
    fragmentShader: NODE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const edgeGeom = new THREE.BufferGeometry()
  edgeGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgePositions), 3))
  edgeGeom.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(edgeSeeds), 1))
  edgeGeom.setAttribute('aTw', new THREE.BufferAttribute(new Float32Array(edgeTws), 1))

  const edgeMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#4a5a8a') },
    },
    vertexShader: EDGE_VERT,
    fragmentShader: EDGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const nodes = new THREE.Points(nodeGeom, nodeMat)
  const links = new THREE.LineSegments(edgeGeom, edgeMat)
  return { nodes, links }
}

export function NeuralNet() {
  const quality = useAppStore((s) => s.quality)
  const lowFx = useAppStore((s) => s.lowFx)
  const group = useRef<THREE.Group>(null)

  const net = useMemo(() => {
    if (lowFx) return null
    const count = quality.tier === 'high' ? 140 : quality.tier === 'medium' ? 100 : 60
    return buildNetwork(count, 2)
  }, [lowFx, quality.tier])

  useFrame(({ clock }) => {
    if (!net) return
    const t = clock.elapsedTime
    ;(net.nodes.material as THREE.ShaderMaterial).uniforms.uTime.value = t
    ;(net.links.material as THREE.ShaderMaterial).uniforms.uTime.value = t
    if (group.current) group.current.rotation.y = t * 0.012
  })

  if (!net) return null

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <primitive object={net.links} />
      <primitive object={net.nodes} />
    </group>
  )
}
