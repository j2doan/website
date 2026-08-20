import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const WIND_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute float aPhase;
attribute float aStream;
attribute float aRadius;
attribute float aSpeed;
attribute float aHeight;
attribute float aAlpha;

varying float vAlpha;
varying float vMix;

void main() {
  float s = fract(aPhase + uTime * aSpeed);
  float coils = 3.0;
  float angle = aStream * 1.7 + s * coils * 6.28318;
  float radius = aRadius + sin(s * 6.28318 + aStream * 2.0) * 0.18;
  float y = s * aHeight - aHeight * 0.5;

  vec3 p = vec3(cos(angle) * radius, y, sin(angle) * radius);

  float fade = sin(s * 3.14159);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uPixelRatio * (1.2 + aAlpha * 1.8) * (320.0 / max(1.0, -mvPosition.z));

  vAlpha = aAlpha * fade;
  vMix = s;
}
`

const WIND_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vMix;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float a = disc * vAlpha;
  if (a < 0.008) discard;
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col * a, a);
}
`

function buildWind(count: number): THREE.Points {
  const phases = new Float32Array(count)
  const streams = new Float32Array(count)
  const radii = new Float32Array(count)
  const speeds = new Float32Array(count)
  const heights = new Float32Array(count)
  const alphas = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const stream = i % 5
    phases[i] = Math.random()
    streams[i] = stream
    radii[i] = 1.25 + stream * 0.14 + Math.random() * 0.25
    speeds[i] = 0.04 + Math.random() * 0.05
    heights[i] = 4.6 + (i % 3) * 0.4
    alphas[i] = 0.35 + Math.random() * 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aStream', new THREE.BufferAttribute(streams, 1))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aHeight', new THREE.BufferAttribute(heights, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorA: { value: new THREE.Color('#5cc8ff') },
      uColorB: { value: new THREE.Color('#9b7bff') },
    },
    vertexShader: WIND_VERT,
    fragmentShader: WIND_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  // Stream positions are computed in the vertex shader (no position attribute),
  // so give the geometry an explicit bound covering radius + wobble + height.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3)
  return points
}

export function DataWind() {
  const lowFx = useAppStore((s) => s.lowFx)
  const points = useMemo(() => buildWind(1300), [])
  useFrame(({ clock }) => {
    if (lowFx) return
    ;(points.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime
  })
  // The wind streams are decorative, so omit them in Low VFX mode.
  if (lowFx) return null
  return <primitive object={points} />
}
