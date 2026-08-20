import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CURRENT_DATA_RIBBON_COLORS } from '../../theme/palette'
import { useAppStore } from '../../store/useAppStore'

const RIBBON_POINT_SIZE = 750
const RIBBON_BRIGHTNESS = 2

interface RibbonBuildConfig {
  pointSize: number
  brightness: number
  bands: number
  perBand: number
}

function ribbonVertexShader(pointSize: number): string {
  return /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute float aPhase;
attribute float aAlpha;
attribute float aSize;
attribute vec3 aColor;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.4 + aPhase * 6.28318) * 0.12;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uPixelRatio * aSize * (${pointSize.toFixed(0)}.0 / max(1.0, -mvPosition.z));

  float flow = 0.5 + 0.5 * sin(aPhase * 12.566 + uTime * 1.4);
  float pulse = pow(flow, 3.0);
  vAlpha = aAlpha * (0.28 + 0.72 * pulse);
  vColor = aColor;
}
`
}

function ribbonFragmentShader(brightness: number): string {
  return /* glsl */ `
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  float a = disc * vAlpha;
  if (a < 0.004) discard;
  vec3 col = vColor * ${brightness.toFixed(2)};
  gl_FragColor = vec4(col * a, a);
}
`
}

function paletteColor(t: number, colors: THREE.Color[]): [number, number, number] {
  const scaled = t * (colors.length - 1)
  const i = Math.min(colors.length - 2, Math.floor(scaled))
  const e = scaled - i
  const c = colors[i].clone().lerp(colors[i + 1], e)
  return [c.r, c.g, c.b]
}

function buildRibbons(cfg: RibbonBuildConfig): THREE.Points {
  const { pointSize, brightness, bands, perBand } = cfg
  const count = bands * perBand
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const alphas = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  const paletteColors = CURRENT_DATA_RIBBON_COLORS.gradient.map(
    (hex) => new THREE.Color(hex),
  )

  const coils = 2.2
  const height = 5.2

  for (let b = 0; b < bands; b++) {
    const radius = 3.9 + b * 0.28 + Math.random() * 0.12
    const yOffset = (b - 1.5) * 0.28
    for (let li = 0; li < perBand; li++) {
      const i = b * perBand + li
      const t = li / perBand
      const angle = t * Math.PI * 2 * coils + b * 1.1
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = t * height - height * 0.5 + yOffset
      positions[i * 3 + 2] = Math.sin(angle) * radius
      phases[i] = t
      alphas[i] = 0.22 + Math.random() * 0.3
      sizes[i] = 0.05 + Math.random() * 0.04
      const colorT = (t + b / bands) % 1
      const rgb = paletteColor(colorT, paletteColors)
      colors[i * 3] = rgb[0]
      colors[i * 3 + 1] = rgb[1]
      colors[i * 3 + 2] = rgb[2]
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: ribbonVertexShader(pointSize),
    fragmentShader: ribbonFragmentShader(brightness),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  return points
}

export function DataRibbons() {
  const lowFx = useAppStore((s) => s.lowFx)
  // The ribbon is decorative, so omit its animation in Low VFX mode.
  const cfg: RibbonBuildConfig = {
    pointSize: RIBBON_POINT_SIZE,
    brightness: RIBBON_BRIGHTNESS,
    bands: 4,
    perBand: 225,
  }
  const points = useMemo(() => buildRibbons(cfg), [])
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }, dt) => {
    if (lowFx) return
    ;(points.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime
    if (group.current) {
      group.current.rotation.y += dt * 0.055
    }
  })

  if (lowFx) return null

  return (
    <group ref={group} position={[0, 1.6, 0]}>
      <primitive object={points} />
    </group>
  )
}
