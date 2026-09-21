import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../scroll/scroll'
import { SECTION_ORDER, useAppStore } from '../store/useAppStore'
import { sampleSectionPose } from './regions/keyframes'
import { computeDetailPose } from './TransitionManager'
import { MotionConfig } from '../config/motion'

const OVERVIEW_FRAME_OFFSET = 2.0

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const view = useAppStore((s) => s.view)
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const loadPhase = useAppStore((s) => s.loadPhase)
  const reduceMotion = useAppStore((s) => s.quality.reducedMotion)
  const setSection = useAppStore((s) => s.setSection)

  const look = useRef(new THREE.Vector3(0, 1.0, 0))
  const sectionPosition = useRef(new THREE.Vector3())
  const sectionTarget = useRef(new THREE.Vector3())
  const viewDirection = useRef(new THREE.Vector3())
  const viewRight = useRef(new THREE.Vector3())
  const framedPosition = useRef(new THREE.Vector3())
  const framedTarget = useRef(new THREE.Vector3())
  const fovRef = useRef(45)
  const snapRef = useRef(MotionConfig.cameraLoadSnap)
  const detailPose = useMemo(
    () => (activeProjectId ? computeDetailPose(activeProjectId) : null),
    [activeProjectId],
  )

  useFrame((state, dt) => {
    // Clamp dt so a tab switch or GC hiccup can't teleport the camera.
    const dtClamped = Math.min(dt, 1 / 30)

    // Ease the snap rate toward its target instead of stepping it, so the
    // slow emergence drift accelerates smoothly into the PROFILE settle.
    const targetSnap =
      loadPhase === 'access'
        ? view === 'detail'
          ? MotionConfig.cameraDetailSnap
          : MotionConfig.cameraOverviewSnap
        : MotionConfig.cameraLoadSnap
    snapRef.current +=
      (targetSnap - snapRef.current) * (1 - Math.exp(-dtClamped * MotionConfig.cameraSnapRamp))

    scrollState.current +=
      (scrollState.target - scrollState.current) *
      (1 - Math.exp(-dtClamped * MotionConfig.scrollSnap))

    // The detail camera is independent of the section timeline. While a
    // project is opening, the smoothed timeline can cross a section boundary;
    // calling setSection there would reset the detail view and clear the
    // active project before ProjectPanel has finished mounting.
    const sectionIndex = Math.round(scrollState.current * (SECTION_ORDER.length - 1))
    if (view !== 'detail' && sectionIndex !== scrollState.sectionIndex) {
      scrollState.sectionIndex = sectionIndex
      setSection(SECTION_ORDER[sectionIndex])
    }

    let pos: THREE.Vector3
    let tgt: THREE.Vector3
    let fov: number
    if (view === 'detail' && detailPose) {
      pos = detailPose.position
      tgt = detailPose.target
      fov = detailPose.fov
    } else {
      const pose = sampleSectionPose(
        scrollState.current,
        sectionPosition.current,
        sectionTarget.current,
      )
      pos = pose.position
      tgt = pose.target
      fov = pose.fov
      if (!reduceMotion) {
        const t = state.clock.elapsedTime
        pos.x += Math.sin(t * 0.2) * 0.25
        pos.y += Math.cos(t * 0.16) * 0.1
      }
    }

    if (view !== 'detail') {
      viewDirection.current.copy(tgt).sub(pos).normalize()
      viewRight.current.crossVectors(viewDirection.current, camera.up).normalize()
      framedPosition.current.copy(pos).addScaledVector(viewRight.current, -OVERVIEW_FRAME_OFFSET)
      framedTarget.current.copy(tgt).addScaledVector(viewRight.current, -OVERVIEW_FRAME_OFFSET)
      pos = framedPosition.current
      tgt = framedTarget.current
    }

    const k = 1 - Math.exp(-dtClamped * snapRef.current)

    camera.position.lerp(pos, k)
    look.current.lerp(tgt, k)

    const fovK = 1 - Math.exp(-dtClamped * MotionConfig.fovSnap)
    fovRef.current += (fov - fovRef.current) * fovK
    if (Math.abs(camera.fov - fovRef.current) > 0.01) {
      camera.fov = fovRef.current
      camera.updateProjectionMatrix()
    }

    camera.lookAt(look.current)
  }, -1)

  return null
}
