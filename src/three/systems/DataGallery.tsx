import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '../../content/projects'
import { useAppStore } from '../../store/useAppStore'
import { orbitState, updateOrbits } from '../regions/positions'
import { burstState } from '../regions/burst'
import { AudioManager } from '../../audio/AudioManager'
import { SFX } from '../../audio/AudioConfig'
import { openProject } from '../TransitionManager'

const GRAY = new THREE.Color(0.62, 0.65, 0.72)
const _target = new THREE.Color()

export function ProjectOrbits() {
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const section = useAppStore((s) => s.section)
  const view = useAppStore((s) => s.view)
  const lowFx = useAppStore((s) => s.lowFx)
  const loadPhase = useAppStore((s) => s.loadPhase)

  // During the emergence opening (before 'access') the orbs are
  // decorative. Snapshot the phase at pointerdown — the global skip-to-access
  // handler on window flips loadPhase before 'click' fires, so gating the
  // click on the live value alone would still open a project prematurely.
  const selectableRef = useRef(false)

  const groups = useRef<(THREE.Group | null)[]>([])
  const cores = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const wires = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const levels = useRef<number[]>(new Array<number>(projects.length).fill(0.5))

  const accentColors = useMemo(
    () => projects.map((p) => new THREE.Color(p.accent)),
    [],
  )
  const activeIndex = useMemo(
    () => (activeProjectId ? Math.max(0, (projects.find((p) => p.id === activeProjectId)?.position ?? 1) - 1) : -1),
    [activeProjectId],
  )

  useFrame(({ clock }, dt) => {
    if (view !== 'detail') {
      updateOrbits(clock.elapsedTime, projects.length)
    }
    for (let i = 0; i < projects.length; i++) {
      const group = groups.current[i]
      if (group && view !== 'detail') {
        group.position.set(
          orbitState.positions[i * 3],
          orbitState.positions[i * 3 + 1],
          orbitState.positions[i * 3 + 2],
        )
      }

      let target: number
      if (view === 'detail') {
        target = i === activeIndex ? 1 - burstState.progress : 0.001
      } else {
        target = section === 'projects' ? 1 : 0.45
      }
      levels.current[i] += (target - levels.current[i]) * (1 - Math.exp(-dt * 2))

      const level = levels.current[i]
      const isShell = view === 'detail' && i === activeIndex
      const isLastShell = burstState.projectId != null && projects[i].id === burstState.projectId

      const tint = !lowFx && isLastShell ? burstState.progress : 0
      _target.copy(accentColors[i]).lerp(GRAY, tint)

      const core = cores.current[i]
      if (core) {
        core.opacity = isShell ? 0.4 + 0.45 * level : 0.85 * level
        core.color.copy(_target)
      }
      const wire = wires.current[i]
      if (wire) {
        wire.opacity = isShell ? 0.14 + 0.11 * level : 0.25 * level
        wire.color.copy(_target)
      }
      if (group) {
        const scale = isShell ? 0.42 + 0.18 * level : 0.45 + 0.55 * level
        group.scale.setScalar(scale)
      }
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
          <mesh scale={p.featured ? 0.42 : 0.3}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial
              color={p.accent}
              transparent
              opacity={0.85}
              ref={(m) => {
                cores.current[i] = m
              }}
            />
          </mesh>
          <mesh scale={p.featured ? 0.62 : 0.46}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={p.accent}
              wireframe
              transparent
              opacity={0.25}
              ref={(m) => {
                wires.current[i] = m
              }}
            />
          </mesh>
          <mesh
            scale={p.featured ? 0.85 : 0.7}
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
