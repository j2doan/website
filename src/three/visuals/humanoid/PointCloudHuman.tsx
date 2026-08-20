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
  const lowFx = useAppStore((s) => s.lowFx)

  // Low VFX pulls the humanoid down to the low-tier particle budget (32k/1.6k)
  // regardless of the detected device tier, so the manual "max performance"
  // toggle trims the heaviest draw in the scene instead of leaving it at 120k.
  const particleCount = lowFx ? 32000 : quality.particleCount
  const innerParticleCount = lowFx ? 1600 : quality.innerParticleCount

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
      pointSize: 0.14,
      chaosRadius: 4,
    })
    const shell = createParticleSystem({
      targets: data.shell,
      chaosSeeds: seedsFor(data.shell),
      colorA: CURRENT_HUMANOID_COLORS.shellA,
      colorB: CURRENT_HUMANOID_COLORS.shellB,
      pointSize: 0.2,
      chaosRadius: 4,
    })
    const head = createParticleSystem({
      targets: data.head,
      chaosSeeds: seedsFor(data.head),
      colorA: CURRENT_HUMANOID_COLORS.headA,
      colorB: CURRENT_HUMANOID_COLORS.headB,
      pointSize: 0.17,
      chaosRadius: 4,
    })
    const inner = createInnerUniverse({
      inside: data.inside,
      colorLow: CURRENT_HUMANOID_COLORS.innerLow,
      colorHigh: CURRENT_HUMANOID_COLORS.innerHigh,
      pointSize: 0.07,
    })
    return { body, shell, head, inner }
  }, [particleCount, innerParticleCount])
  const systems = useMemo(() => [body, shell, head, inner], [body, shell, head, inner])

  const progressRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    const targetProgress = loadPhase === 'void' || loadPhase === 'chaos' ? 0 : 1
    progressRef.current += (targetProgress - progressRef.current) * 0.018

    if (groupRef.current) {
      const breath = 1 + Math.sin(t * 1.6) * 0.006
      groupRef.current.scale.setScalar(breath)
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 0.5) * 0.02 + Math.sin(t * 0.13 + 1.7) * 0.008
      bodyRef.current.rotation.x = Math.sin(t * 0.32 + 0.8) * 0.012
      bodyRef.current.position.y = Math.sin(t * 0.55) * 0.04
    }

    const uPhase = PHASE_VALUE[loadPhase]
    for (const system of systems) {
      const m = system.material as THREE.ShaderMaterial
      m.uniforms.uTime.value = t
      if (m.uniforms.uProgress) m.uniforms.uProgress.value = progressRef.current
      if (m.uniforms.uPhase) m.uniforms.uPhase.value = uPhase
    }

    if (headRef.current) {
      const targetYaw = Math.max(-0.4, Math.min(0.4, Math.atan2(camera.position.x, camera.position.z)))
      yawRef.current += (targetYaw - yawRef.current) * 0.04
      const distance = Math.max(1, Math.hypot(camera.position.x, camera.position.z))
      const targetPitch = Math.max(
        -0.18,
        Math.min(0.18, Math.atan2(camera.position.y - 3.6, distance)),
      )
      pitchRef.current += (targetPitch - pitchRef.current) * 0.04
      headRef.current.rotation.y = yawRef.current
      headRef.current.rotation.x = pitchRef.current
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
