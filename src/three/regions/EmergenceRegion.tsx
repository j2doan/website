import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PointCloudHuman } from '../visuals/humanoid/PointCloudHuman'

export function CenterStage() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ringRef.current) ringRef.current.rotation.z += 0.002
  })

  return (
    <group>
      <PointCloudHuman />
      <mesh ref={ringRef} rotation-x={Math.PI / 2} position={[0, -1.3, 0]}>
        <torusGeometry args={[3.6, 0.008, 8, 96]} />
        <meshBasicMaterial color="#3a6bbf" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}
