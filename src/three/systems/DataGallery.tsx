import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ThinkingOrb } from 'thinking-orbs'
import { projects } from '../../content/projects'
import { useAppStore } from '../../store/useAppStore'
import { orbitState, updateOrbits } from '../regions/positions'
import { AudioManager } from '../../audio/AudioManager'
import { SFX } from '../../audio/AudioConfig'
import { openProject } from '../TransitionManager'
import { PROJECT_ORB_STATES } from '../../config/orb'

export function ProjectOrbits() {
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const view = useAppStore((s) => s.view)
  const loadPhase = useAppStore((s) => s.loadPhase)

  // During the emergence opening (before 'access') the orbs are
  // decorative. Snapshot the phase at pointerdown — the global skip-to-access
  // handler on window flips loadPhase before 'click' fires, so gating the
  // click on the live value alone would still open a project prematurely.
  const selectableRef = useRef(false)

  const groups = useRef<(THREE.Group | null)[]>([])
  const visuals = useRef<(HTMLDivElement | null)[]>([])
  const distances = useRef(new Float32Array(projects.length))
  const activeIndex = useMemo(
    () => (activeProjectId ? Math.max(0, (projects.find((p) => p.id === activeProjectId)?.position ?? 1) - 1) : -1),
    [activeProjectId],
  )

  useFrame(({ clock, camera }) => {
    if (view !== 'detail') {
      updateOrbits(clock.elapsedTime, projects.length)
    }

    let nearest = Infinity
    let farthest = 0
    for (let i = 0; i < projects.length; i++) {
      const group = groups.current[i]
      if (group && view !== 'detail') {
        group.position.set(
          orbitState.positions[i * 3],
          orbitState.positions[i * 3 + 1],
          orbitState.positions[i * 3 + 2],
        )
      }

      if (group) group.scale.setScalar(1)
      if (group) {
        const distance = camera.position.distanceTo(group.position)
        distances.current[i] = distance
        if (distance < nearest) nearest = distance
        if (distance > farthest) farthest = distance
      }
    }

    if (nearest === Infinity) return

    const range = Math.max(0.001, farthest - nearest)
    for (let i = 0; i < projects.length; i++) {
      const visual = visuals.current[i]
      if (!visual) continue
      const relativeDistance = (distances.current[i] - nearest) / range
      visual.style.opacity = String(1 - relativeDistance * 0.35)
    }
  })

  return (
    <group>
      {projects.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            groups.current[i] = el
          }}
        >
          <Html
            center
            zIndexRange={[1, 0]}
            className={`project-orb-html${
              view === 'detail' && i === activeIndex
                ? ' is-active'
                : view === 'detail'
                  ? ' is-dim'
                  : ''
            }`}
            style={{ pointerEvents: 'none' }}
          >
            <div
              ref={(element) => {
                visuals.current[i] = element
              }}
              className="project-orb__visual"
            >
              <ThinkingOrb
                state={PROJECT_ORB_STATES[i]}
                size={64}
                theme="dark"
                paused={false}
                aria-label={`${p.title} project orb`}
              />
            </div>
          </Html>
          <mesh
            scale={p.featured ? 1.05 : 0.9}
            onPointerDown={() => {
              selectableRef.current = loadPhase === 'access'
            }}
            onPointerOver={(e) => {
              if (view === 'detail' || loadPhase !== 'access') return
              e.stopPropagation()
              AudioManager.playSfx(SFX.orbHover)
            }}
            onClick={(e) => {
              e.stopPropagation()
              // In detail view the open orb is intentionally inert —
              // projects close only via the Main Menu back button or Escape.
              if (view === 'detail' || !selectableRef.current) return
              openProject(p.id)
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial colorWrite={false} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
