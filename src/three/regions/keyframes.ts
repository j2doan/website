import * as THREE from 'three'
import { SECTIONS } from '../../config/sections'

export interface SectionCameraPose {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

// Camera poses come from the central section registry (config/sections.ts).
const POSE_DEFS = SECTIONS.map((s) => s.camera)

export const SECTION_CAMERAS: SectionCameraPose[] = POSE_DEFS.map((def) => ({
  position: new THREE.Vector3(...def.position),
  target: new THREE.Vector3(...def.target),
  fov: def.fov,
}))

const POSITION_CURVE = new THREE.CatmullRomCurve3(
  SECTION_CAMERAS.map((c) => c.position),
  false,
  'catmullrom',
  0.5,
)
const TARGET_CURVE = new THREE.CatmullRomCurve3(
  SECTION_CAMERAS.map((c) => c.target),
  false,
  'catmullrom',
  0.5,
)

function ease(frac: number): number {
  return frac * frac * (3 - 2 * frac)
}

export function sampleSectionPose(
  progress: number,
  position = new THREE.Vector3(),
  target = new THREE.Vector3(),
): SectionCameraPose {
  const p = Math.min(1, Math.max(0, progress))
  POSITION_CURVE.getPoint(p, position)
  TARGET_CURVE.getPoint(p, target)
  const scaled = p * (SECTION_CAMERAS.length - 1)
  const i = Math.min(SECTION_CAMERAS.length - 2, Math.floor(scaled))
  const fov =
    SECTION_CAMERAS[i].fov +
    (SECTION_CAMERAS[i + 1].fov - SECTION_CAMERAS[i].fov) * ease(scaled - i)
  return { position, target, fov }
}

export interface SectionVisual {
  ambient: number
  keyColor: THREE.Color
  keyPosition: THREE.Vector3
  keyIntensity: number
  fog: number
  bg: THREE.Color
}

interface VisualDef {
  ambient: number
  keyColor: string
  keyPosition: [number, number, number]
  keyIntensity: number
  fog: number
  bg: string
}

// Lighting + background treatments come from the section registry.
const VISUAL_DEFS: VisualDef[] = SECTIONS.map((s) => s.visual)

export const SECTION_VISUALS: SectionVisual[] = VISUAL_DEFS.map((def) => ({
  ambient: def.ambient,
  keyColor: new THREE.Color(def.keyColor),
  keyPosition: new THREE.Vector3(...def.keyPosition),
  keyIntensity: def.keyIntensity,
  fog: def.fog,
  bg: new THREE.Color(def.bg),
}))

const _keyColor = new THREE.Color()
const _keyPosition = new THREE.Vector3()
const _bg = new THREE.Color()
const _visualResult: SectionVisualResult = {
  ambient: 0,
  keyColor: _keyColor,
  keyPosition: _keyPosition,
  keyIntensity: 0,
  fog: 0,
  bg: _bg,
}

export interface SectionVisualResult {
  ambient: number
  keyColor: THREE.Color
  keyPosition: THREE.Vector3
  keyIntensity: number
  fog: number
  bg: THREE.Color
}

export function sampleSectionVisual(progress: number): SectionVisualResult {
  const p = Math.min(1, Math.max(0, progress))
  const scaled = p * (SECTION_VISUALS.length - 1)
  const i = Math.min(SECTION_VISUALS.length - 2, Math.floor(scaled))
  const e = ease(scaled - i)
  const a = SECTION_VISUALS[i]
  const b = SECTION_VISUALS[i + 1]
  _visualResult.ambient = a.ambient + (b.ambient - a.ambient) * e
  _visualResult.keyColor.copy(a.keyColor).lerp(b.keyColor, e)
  _visualResult.keyPosition.copy(a.keyPosition).lerp(b.keyPosition, e)
  _visualResult.keyIntensity = a.keyIntensity + (b.keyIntensity - a.keyIntensity) * e
  _visualResult.fog = a.fog + (b.fog - a.fog) * e
  _visualResult.bg.copy(a.bg).lerp(b.bg, e)
  return _visualResult
}
