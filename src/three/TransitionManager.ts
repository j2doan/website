import * as THREE from 'three'
import { projects } from '../content/projects'
import { SECTION_ORDER, useAppStore } from '../store/useAppStore'
import { scrollState } from '../scroll/scroll'
import { orbitState } from './regions/positions'
import { acquireTransitionLock } from './transitionLock'
import { AudioManager } from '../audio/AudioManager'
import { SFX } from '../audio/AudioConfig'

export interface CameraPose {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

export function transitionToSection(index: number): void {
  // Section navigation is an explicit request to leave project detail. Keep
  // this separate from passive camera section sampling, which must preserve a
  // project opened in the same frame.
  useAppStore.getState().setView('overview')
  useAppStore.getState().setSection(SECTION_ORDER[index])
  scrollState.target = index / (SECTION_ORDER.length - 1)
  AudioManager.playSfx(SFX.section)
}

/**
 * Shared project-opening path. Project orbs and the Projects panel list both
 * route through here so their behavior stays identical —
 * transition lock, select sound, camera focus, burst, artwork card, panel.
 */
export function openProject(projectId: string): void {
  if (!acquireTransitionLock()) return
  AudioManager.playSfx(SFX.orbSelect)
  useAppStore.getState().setView('detail', projectId)
}

export function computeDetailPose(projectId: string): CameraPose {
  const project = projects.find((p) => p.id === projectId)
  const i = project ? project.position - 1 : 0
  const x = orbitState.positions[i * 3] ?? 4
  const y = orbitState.positions[i * 3 + 1] ?? 0
  const z = orbitState.positions[i * 3 + 2] ?? 4
  const dir = new THREE.Vector3(x, y, z).normalize()
  return {
    position: new THREE.Vector3(x + dir.x * 3.0, y + dir.y * 3.0 + 0.2, z + dir.z * 3.0),
    target: new THREE.Vector3(x, y, z),
    fov: 38,
  }
}
