import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '../../content/projects'
import { useAppStore } from '../../store/useAppStore'
import { orbitState } from '../regions/positions'
import { burstState } from '../regions/burst'

const BURST_VERT = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;

attribute vec3 aDir;
attribute float aRadius;
attribute float aSpeed;
attribute float aTint;
attribute float aSize;

varying float vAlpha;
varying float vTint;

void main() {
  float p = clamp(uProgress, 0.0, 1.0);

  // anticipation: starts slow, accelerates, then slows near maximum size
  float sp = p * p * (3.0 - 2.0 * p);
  float settle = smoothstep(0.8, 1.0, p);
  float spread = mix(sp, 1.0, settle * 0.55);

  vec3 pos = aDir * (aRadius * 0.85 * spread);

  float phase = aTint * 6.28318 + aSpeed;
  pos += vec3(
    sin(uTime * 0.7 + phase) * 0.1,
    cos(uTime * 0.55 + phase * 1.3) * 0.1,
    sin(uTime * 0.6 + phase * 0.7) * 0.1
  ) * spread;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uPixelRatio * (0.3 + aSize * 3.0) * (130.0 / max(1.0, -mvPosition.z));

  float env = smoothstep(0.0, 0.18, p);
  vAlpha = env * (0.16 + aTint * 0.18);
  vTint = aTint;
}
`

const BURST_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vTint;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float core = pow(disc, 0.85);
  float halo = disc * disc * disc;
  float a = core * vAlpha + halo * vAlpha * 0.4;
  if (a < 0.004) discard;
  vec3 col = mix(uColorA, uColorB, vTint);
  gl_FragColor = vec4(col, a);
}
`

function buildBurst(count: number): THREE.Points {
  const dirs = new Float32Array(count * 3)
  const radii = new Float32Array(count)
  const speeds = new Float32Array(count)
  const tints = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    dirs[i * 3] = Math.sin(phi) * Math.cos(theta)
    dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta)
    dirs[i * 3 + 2] = Math.cos(phi)
    radii[i] = 0.2 + Math.random() * 0.85
    speeds[i] = 0.5 + Math.random() * 1.2
    tints[i] = Math.random()
    sizes[i] = 0.04 + Math.random() * 0.09
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorA: { value: new THREE.Color('#5cc8ff') },
      uColorB: { value: new THREE.Color('#27466b') },
    },
    vertexShader: BURST_VERT,
    fragmentShader: BURST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })

  const points = new THREE.Points(geometry, material)
  // Geometry positions are authored in the vertex shader (aDir * radius), so
  // the computed sphere would be a zero-radius point at the origin. Give it a
  // real bound (~max spread + jitter) so it can be frustum-culled safely.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.3)
  return points
}

export function BurstEffect() {
  const view = useAppStore((s) => s.view)
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const section = useAppStore((s) => s.section)
  const lowFx = useAppStore((s) => s.lowFx)

  const points = useMemo(() => buildBurst(lowFx ? 120 : 380), [lowFx])
  const lastProjectRef = useRef<string | null>(null)

  useFrame(({ clock }, dt) => {
    if (activeProjectId && activeProjectId !== lastProjectRef.current) {
      lastProjectRef.current = activeProjectId
      burstState.projectId = activeProjectId
    }

    const opening = view === 'detail' && activeProjectId != null
    const target = opening ? 1 : 0
    const k = 1 - Math.exp(-dt * 0.6)
    burstState.progress += (target - burstState.progress) * k

    const material = points.material as THREE.ShaderMaterial
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uProgress.value = burstState.progress

    const project = burstState.projectId
      ? projects.find((p) => p.id === burstState.projectId)
      : undefined

    if (project) {
      const i = project.position - 1
      points.position.set(
        orbitState.positions[i * 3] ?? 0,
        orbitState.positions[i * 3 + 1] ?? 0,
        orbitState.positions[i * 3 + 2] ?? 0,
      )
      const accent = project.accent.startsWith('#') ? project.accent : `#${project.accent}`
      ;(material.uniforms.uColorA.value as THREE.Color).set(accent)
      ;(material.uniforms.uColorB.value as THREE.Color).set(accent).multiplyScalar(0.45)
    }

    const visible = burstState.progress > 0.002 && burstState.projectId != null
    // Low VFX hides the burst particles while continuing to drive
    // burstState.progress so the orb color desaturation/restoration still plays.
    points.visible = !lowFx && visible && section !== 'linktree'
  })

  return <primitive object={points} />
}
