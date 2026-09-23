import * as THREE from 'three'

export interface ParticleSystemOptions {
  targets: Float32Array
  chaosSeeds: Float32Array
  colorA: [number, number, number]
  colorB: [number, number, number]
  pointSize: number
  chaosRadius: number
}

export interface InnerUniverseOptions {
  inside: Float32Array
  colorLow: [number, number, number]
  colorHigh: [number, number, number]
  pointSize: number
}

const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPhase;
uniform float uChaosRadius;
uniform float uPointSize;
uniform float uPixelRatio;

attribute vec3 aTarget;
attribute vec3 aSeed;
attribute float aAlpha;
attribute float aReveal;

varying float vAlpha;
varying float vGlow;
varying float vReveal;
varying float vPulse;

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float formed = smoothstep(0.0, 1.0, p);
  float t = uTime;

  vec3 chaos = aTarget + aSeed * uChaosRadius;
  chaos.x += sin(t * 0.6 + aSeed.x * 7.0) * 0.4 * (1.0 - formed);
  chaos.y += sin(t * 0.45 + aSeed.y * 5.0) * 0.35 * (1.0 - formed);
  chaos.z += cos(t * 0.5 + aSeed.z * 6.0) * 0.3 * (1.0 - formed);

  float pivotY = 1.0;
  float breathe = 1.0 + 0.025 * sin(t * 1.4);
  vec3 formedPos = aTarget;
  formedPos.y = pivotY + (formedPos.y - pivotY) * breathe;

  vec3 pos = aTarget;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = uPointSize * uPixelRatio * (aAlpha * 0.6 + 0.4) * (1.0 + 0.3 * uPhase * 0.08);
  gl_PointSize = size * (520.0 / max(1.0, -mvPosition.z));

  vAlpha = aAlpha;
  vGlow = clamp((uPhase - 2.4) * 0.7, 0.0, 1.0);
  vReveal = smoothstep(aReveal - 0.035, aReveal + 0.035, p);
  vPulse = 0.5 + 0.5 * sin(uTime * (0.8 + aReveal * 1.4) + aReveal * 31.0);
}
`

const PARTICLE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vGlow;
varying float vReveal;
varying float vPulse;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float core = disc * disc;
  float a = core * vAlpha * vReveal * (0.4 + 1.4 * vPulse) * (0.5 + 0.9 * vGlow);
  if (a < 0.004) discard;
  vec3 col = mix(uColorA, uColorB, vGlow);
  gl_FragColor = vec4(col * a, a);
}
`

const INNER_VERT = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPhase;
uniform float uPointSize;
uniform float uPixelRatio;

attribute float aAlpha;
attribute float aReveal;

varying float vMix;
varying float vAlpha;
varying float vReveal;
varying float vPulse;

void main() {
  vec3 pos = position;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = uPointSize * uPixelRatio * (aAlpha * 0.6 + 0.4);
  gl_PointSize = size * (520.0 / max(1.0, -mvPosition.z));

  vMix = clamp((pos.y + 0.9) / 2.4, 0.0, 1.0);
  vAlpha = aAlpha;
  vReveal = smoothstep(aReveal - 0.035, aReveal + 0.035, uProgress);
  vPulse = 0.5 + 0.5 * sin(uTime * (0.8 + aReveal * 1.4) + aReveal * 31.0);
}
`

const INNER_FRAG = /* glsl */ `
uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform float uPhase;
varying float vMix;
varying float vAlpha;
varying float vReveal;
varying float vPulse;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float core = disc * disc;
  float a = core * vAlpha * vReveal * (0.4 + 1.4 * vPulse) * 1.15;
  if (a < 0.004) discard;
  vec3 col = mix(uColorLow, uColorHigh, vMix);
  gl_FragColor = vec4(col * a, a);
}
`

export function createParticleSystem(opts: ParticleSystemOptions): THREE.Points {
  const count = opts.targets.length / 3
  const alphas = new Float32Array(count)
  const reveals = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453
    alphas[i] = 0.55 + (hash - Math.floor(hash)) * 0.45
    reveals[i] = hash - Math.floor(hash)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(opts.targets, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(opts.chaosSeeds, 3))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
  geometry.setAttribute('aReveal', new THREE.BufferAttribute(reveals, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPhase: { value: 0 },
      uChaosRadius: { value: opts.chaosRadius },
      uPointSize: { value: opts.pointSize },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorA: { value: new THREE.Color(opts.colorA[0], opts.colorA[1], opts.colorA[2]) },
      uColorB: { value: new THREE.Color(opts.colorB[0], opts.colorB[1], opts.colorB[2]) },
    },
    vertexShader: PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  // Formed particles live at aTarget; during the chaos phase they scatter up to
  // chaosRadius further. Compute a bounding sphere that covers both so the
  // humanoid can be frustum-culled without popping out mid-sequence.
  const bound = new THREE.Sphere(new THREE.Vector3(), 0)
  for (let i = 0; i < opts.targets.length; i += 3) {
    const r = Math.hypot(opts.targets[i], opts.targets[i + 1], opts.targets[i + 2])
    if (r > bound.radius) bound.radius = r
  }
  bound.radius += opts.chaosRadius + 0.5
  geometry.boundingSphere = bound
  return points
}

export function createInnerUniverse(opts: InnerUniverseOptions): THREE.Points {
  const count = opts.inside.length / 3
  const alphas = new Float32Array(count)
  const reveals = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453
    alphas[i] = 0.55 + (hash - Math.floor(hash)) * 0.45
    reveals[i] = hash - Math.floor(hash)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(opts.inside, 3))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
  geometry.setAttribute('aReveal', new THREE.BufferAttribute(reveals, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPhase: { value: 0 },
      uPointSize: { value: opts.pointSize },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorLow: { value: new THREE.Color(opts.colorLow[0], opts.colorLow[1], opts.colorLow[2]) },
      uColorHigh: {
        value: new THREE.Color(opts.colorHigh[0], opts.colorHigh[1], opts.colorHigh[2]),
      },
    },
    vertexShader: INNER_VERT,
    fragmentShader: INNER_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  return points
}
