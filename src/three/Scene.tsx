import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'
import { CenterStage } from './regions/EmergenceRegion'
import { OrbitGallery } from './regions/GalleryRegion'
import { GridWave } from './systems/GridWave'
import { GridMatrix } from './systems/GridMatrix'
import { KineticType } from './systems/KineticType'
import { LightingState } from './LightingState'
import { CameraRig } from './CameraController'
import { EffectStack } from './fx/EffectStack'
import { AdaptiveQuality } from './AdaptiveQuality'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function SceneReady({ onReady }: { onReady: () => void }) {
  const notified = useRef(false)
  useFrame(() => {
    if (notified.current) return
    notified.current = true
    onReady()
  })
  return null
}

export function Scene({ onReady }: { onReady: () => void }) {
  const quality = useAppStore((s) => s.quality)

  return (
    <Canvas
      dpr={quality.dpr}
      camera={{ fov: 45, near: 0.1, far: 300, position: [0, 0.6, 14] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color('#020308')
        scene.fog = new THREE.FogExp2('#020308', 0.011)
      }}
    >
      <KineticType />
      <CenterStage />
      <OrbitGallery />
      <GridMatrix />
      <GridWave />
      <LightingState />
      <CameraRig />
      <EffectStack />
      <AdaptiveQuality />
      <SceneReady onReady={onReady} />
    </Canvas>
  )
}
