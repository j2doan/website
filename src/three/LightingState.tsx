import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../scroll/scroll'
import { sampleSectionVisual } from './regions/keyframes'

export function LightingState() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const keyRef = useRef<THREE.DirectionalLight>(null)
  const current = useRef({
    ambient: 0.42,
    keyIntensity: 1.5,
    fog: 0.011,
    keyColor: new THREE.Color('#9cc8ff'),
    keyPos: new THREE.Vector3(3, 4, 5),
    bg: new THREE.Color('#020308'),
  })

  useFrame(({ scene }, dt) => {
    const target = sampleSectionVisual(scrollState.current)
    const s = current.current
    const k = 1 - Math.exp(-dt * 1.4)

    s.ambient += (target.ambient - s.ambient) * k
    s.keyIntensity += (target.keyIntensity - s.keyIntensity) * k
    s.fog += (target.fog - s.fog) * k
    s.keyColor.lerp(target.keyColor, k)
    s.keyPos.lerp(target.keyPosition, k)
    s.bg.lerp(target.bg, k)

    if (ambientRef.current) ambientRef.current.intensity = s.ambient
    if (keyRef.current) {
      keyRef.current.intensity = s.keyIntensity
      keyRef.current.color.copy(s.keyColor)
      keyRef.current.position.copy(s.keyPos)
    }

    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) fog.density = s.fog
    const background = scene.background as THREE.Color | null
    if (background) background.copy(s.bg)
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.42} />
      <directionalLight ref={keyRef} intensity={1.5} color="#9cc8ff" position={[3, 4, 5]} />
    </>
  )
}
