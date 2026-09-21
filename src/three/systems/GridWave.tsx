import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
varying float vWave;
varying float vDistance;

void main() {
  vec3 p = position;
  float wave = sin(p.x * 0.11 + uTime * 0.36) * 0.7
             + sin(p.z * 0.17 - uTime * 0.29) * 0.55
             + sin((p.x - p.z) * 0.07 + uTime * 0.18) * 0.42
             + cos((p.x + p.z) * 0.045 - uTime * 0.23) * 0.35;
  p.y += wave;
  vWave = wave;
  vDistance = length(p.xz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const FRAGMENT_SHADER = /* glsl */ `
varying float vWave;
varying float vDistance;

void main() {
  float depthFade = 1.0 - smoothstep(70.0, 160.0, vDistance);
  float lightness = 0.3 + clamp(vWave * 0.16, -0.12, 0.2);
  float alpha = (0.08 + max(vWave, 0.0) * 0.12) * depthFade;
  gl_FragColor = vec4(vec3(lightness), alpha);
}
`

export function GridWave() {
  const segments = 112
  const grid = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(320, 320, segments, segments)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    return mesh
  }, [segments])

  useFrame(({ clock }) => {
    ;(grid.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime
  })

  return <primitive object={grid} position={[0, -17.5, 0]} />
}
