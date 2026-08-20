import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

function setGridOpacity(grid: THREE.GridHelper, opacity: number): void {
  const material = grid.material as THREE.Material | THREE.Material[]
  const list = Array.isArray(material) ? material : [material]
  list.forEach((m) => {
    m.transparent = true
    m.opacity = opacity
  })
}

function buildDust(count: number): THREE.Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 6 + Math.random() * 34
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.4
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: '#5a86c0',
    size: 0.06,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return points
}

export function GridEnvironment() {
  const lowFx = useAppStore((s) => s.lowFx)

  const floor = useMemo(() => {
    const grid = new THREE.GridHelper(180, lowFx ? 28 : 48, 0x1a3a5e, 0x16283f)
    grid.position.y = -2.55
    setGridOpacity(grid, 0.22)
    return grid
  }, [lowFx])

  const back = useMemo(() => {
    const grid = new THREE.GridHelper(220, lowFx ? 32 : 56, 0x1a3a5e, 0x131f33)
    grid.rotation.x = Math.PI / 2
    grid.position.set(0, 6, -60)
    setGridOpacity(grid, 0.14)
    return grid
  }, [lowFx])

  const dust = useMemo(() => buildDust(lowFx ? 220 : 700), [lowFx])

  useFrame(({ clock }) => {
    dust.rotation.y = clock.elapsedTime * 0.008
  })

  return (
    <>
      <primitive object={floor} />
      <primitive object={back} />
      <primitive object={dust} />
    </>
  )
}
