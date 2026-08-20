import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const OCEAN_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

varying float vH;
varying float vA;

void main() {
  vec3 p = position;
  float h = sin(p.x * 0.08 + uTime * 0.5) * 1.3
          + sin(p.z * 0.07 - uTime * 0.4) * 1.1
          + sin((p.x + p.z) * 0.04 + uTime * 0.28) * 1.5;
  p.y = h;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float d = -mvPosition.z;
  gl_PointSize = uPixelRatio * (30.0 / max(1.0, d)) * (1.0 + 0.7 * sin(p.x * 0.25 + p.z * 0.2 + uTime * 0.6));

  vH = (h + 4.5) / 9.0;
  vA = clamp(1.0 - d / 170.0, 0.0, 1.0);
}
`

const OCEAN_FRAG = /* glsl */ `
varying float vH;
varying float vA;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  vec3 deep = vec3(0.03, 0.08, 0.22);
  vec3 crest = vec3(0.32, 0.72, 1.0);
  vec3 col = mix(deep, crest, vH);
  float a = disc * (0.07 + 0.5 * vH) * vA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col * a, a);
}
`

export function DataOcean() {
  const quality = useAppStore((s) => s.quality)
  const lowFx = useAppStore((s) => s.lowFx)

  const cells = lowFx ? Math.max(32, Math.round(quality.oceanCells * 0.4)) : quality.oceanCells

  const ocean = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(220, 220, cells, cells)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      vertexShader: OCEAN_VERT,
      fragmentShader: OCEAN_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    return points
  }, [cells])

  useFrame(({ clock }) => {
    ;(ocean.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime
  })

  return <primitive object={ocean} position={[0, -2.2, 0]} />
}
