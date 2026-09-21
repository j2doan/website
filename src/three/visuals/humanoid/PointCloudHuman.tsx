import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore, type LoadPhase } from '../../../store/useAppStore'
import { createParticleSystem, createInnerUniverse } from '../shared/ParticleSystem'
import { buildHumanoidData } from './humanoid'
import { buildHumanoidMeshData } from './humanoidMesh'
import { CURRENT_HUMANOID_COLORS } from '../../../theme/palette'

// Select the anatomical OBJ pipeline or the procedural fallback.
//  true  -> OBJ-derived humanoid (malebody.obj reference)
//  false -> Procedural primitive humanoid (humanoid.ts)
const USE_OBJ_HUMANOID = true

const PHASE_VALUE: Record<LoadPhase, number> = {
  void: 0,
  chaos: 1,
  formation: 2,
  activation: 3,
  access: 4,
}

export function PointCloudHuman() {
  const quality = useAppStore((s) => s.quality)
  const loadPhase = useAppStore((s) => s.loadPhase)

  const particleCount = quality.particleCount
  const innerParticleCount = quality.innerParticleCount

  const { body, shell, head, inner } = useMemo(() => {
    const data = USE_OBJ_HUMANOID
      ? buildHumanoidMeshData(particleCount, innerParticleCount)
      : buildHumanoidData(particleCount, innerParticleCount)
    const seedsFor = (targets: Float32Array) => {
      const seeds = new Float32Array(targets.length)
      for (let i = 0; i < seeds.length; i++) {
        seeds[i] = (Math.random() * 2 - 1) * (0.4 + Math.random() * 0.6)
      }
      return seeds
    }
    const body = createParticleSystem({
      targets: data.body,
      chaosSeeds: seedsFor(data.body),
      colorA: CURRENT_HUMANOID_COLORS.bodyA,
      colorB: CURRENT_HUMANOID_COLORS.bodyB,
       pointSize: 0.18,
      chaosRadius: 4,
    })
    const shell = createParticleSystem({
      targets: data.shell,
      chaosSeeds: seedsFor(data.shell),
      colorA: CURRENT_HUMANOID_COLORS.shellA,
      colorB: CURRENT_HUMANOID_COLORS.shellB,
       pointSize: 0.27,
      chaosRadius: 4,
    })
    const head = createParticleSystem({
      targets: data.head,
      chaosSeeds: seedsFor(data.head),
      colorA: CURRENT_HUMANOID_COLORS.headA,
      colorB: CURRENT_HUMANOID_COLORS.headB,
       pointSize: 0.22,
      chaosRadius: 4,
    })
    const inner = createInnerUniverse({
      inside: data.inside,
      colorLow: CURRENT_HUMANOID_COLORS.innerLow,
      colorHigh: CURRENT_HUMANOID_COLORS.innerHigh,
       pointSize: 0.09,
    })
    return { body, shell, head, inner }
  }, [particleCount, innerParticleCount])
  const systems = useMemo(() => [body, shell, head, inner], [body, shell, head, inner])

  const progressRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const targetProgress = loadPhase === 'void' || loadPhase === 'chaos' ? 0 : 1
    progressRef.current += (targetProgress - progressRef.current) * 0.018

    if (bodyRef.current) {
      bodyRef.current.rotation.z = 0
      bodyRef.current.rotation.x = 0
      bodyRef.current.position.y = 0
    }

    const uPhase = PHASE_VALUE[loadPhase]
    for (const system of systems) {
      const m = system.material as THREE.ShaderMaterial
      m.uniforms.uTime.value = t
      if (m.uniforms.uProgress) m.uniforms.uProgress.value = progressRef.current
      if (m.uniforms.uPhase) m.uniforms.uPhase.value = uPhase
    }

    if (headRef.current) {
      headRef.current.rotation.y = 0
      headRef.current.rotation.x = 0
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      <group ref={bodyRef}>
        <primitive object={body} />
        <primitive object={shell} />
        <primitive object={inner} />
      </group>
      <group ref={headRef}>
        <primitive object={head} />
      </group>
    </group>
  )
}
