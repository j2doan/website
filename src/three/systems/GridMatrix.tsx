import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const FLOOR_Y = -17.25
const CEILING_Y = 58
const HALF_WIDTH = 144
const HALF_DEPTH = 144
const CENTRAL_CLEAR_RADIUS = 60
const CENTRAL_CLEAR_AXIS = 36

function addSegment(vertices: number[], a: [number, number, number], b: [number, number, number]) {
  vertices.push(...a, ...b)
}

export function GridMatrix() {
  const tier = useAppStore((s) => s.quality.tier)
  const xDivisions = tier === 'high' ? 9 : tier === 'medium' ? 7 : 5
  const zDivisions = tier === 'high' ? 9 : tier === 'medium' ? 7 : 5
  const heightLevels = tier === 'high' ? 4 : tier === 'medium' ? 4 : 3

  const grid = useMemo(() => {
    const vertices: number[] = []
    const xStep = (HALF_WIDTH * 2) / (xDivisions - 1)
    const zStep = (HALF_DEPTH * 2) / (zDivisions - 1)
    const heightStep = (CEILING_Y - FLOOR_Y) / (heightLevels - 1)
    const xStart = -HALF_WIDTH + xStep * 0.5
    const xEnd = xStart + xStep * (xDivisions - 1)
    const zStart = -HALF_DEPTH + zStep * 0.5
    const zEnd = zStart + zStep * (zDivisions - 1)

    // Vertical columns rise from the floor at every X/Z grid intersection.
    for (let xi = 0; xi < xDivisions; xi++) {
      const x = xStart + xi * xStep
      for (let zi = 0; zi < zDivisions; zi++) {
        const z = zStart + zi * zStep
        if (Math.hypot(x, z) < CENTRAL_CLEAR_RADIUS) continue
        addSegment(vertices, [x, FLOOR_Y, z], [x, CEILING_Y, z])
      }
    }

    // Horizontal cross-lines connect the columns on every Y plane in both axes.
    for (let yi = 1; yi < heightLevels; yi++) {
      const y = FLOOR_Y + yi * heightStep
      for (let zi = 0; zi < zDivisions; zi++) {
        const z = zStart + zi * zStep
        if (Math.abs(z) < CENTRAL_CLEAR_AXIS) continue
        addSegment(vertices, [xStart, y, z], [xEnd, y, z])
      }
      for (let xi = 0; xi < xDivisions; xi++) {
        const x = xStart + xi * xStep
        if (Math.abs(x) < CENTRAL_CLEAR_AXIS) continue
        addSegment(vertices, [x, y, zStart], [x, y, zEnd])
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    const material = new THREE.LineBasicMaterial({
      color: '#687078',
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const lines = new THREE.LineSegments(geometry, material)
    lines.rotation.y = Math.PI / 4
    lines.frustumCulled = false
    return lines
  }, [xDivisions, zDivisions, heightLevels])

  return <primitive object={grid} />
}
