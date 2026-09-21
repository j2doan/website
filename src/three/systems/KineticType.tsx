import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTIONS } from '../../config/sections'
import { useAppStore } from '../../store/useAppStore'

const WIDTH = 8192
const HEIGHT = 840
const PLANE_WIDTH = 154.66
const KINETIC_X = -20
const DEPTH_LAYERS = 28
const DEPTH_STEP = 4

function makeTexture(word: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
    grad.addColorStop(0, 'rgba(240, 240, 240, 0.2)')
    grad.addColorStop(0.55, 'rgba(240, 240, 240, 0.07)')
    grad.addColorStop(1, 'rgba(240, 240, 240, 0)')
    ctx.fillStyle = grad
    ctx.font = '900 230px "Segoe UI", "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const spacing = 0.09
    const widths: number[] = []
    for (const char of word) widths.push(ctx.measureText(char).width)
    const gaps = widths.length > 1 ? widths.slice(0, -1).reduce((acc, w) => acc + w * spacing, 0) : 0
    const total = widths.reduce((acc, w) => acc + w, 0) + gaps
    let x = (WIDTH - total) / 2
    for (let i = 0; i < word.length; i++) {
      ctx.fillText(word[i], x, HEIGHT * 0.5 + 10)
      x += widths[i] * (1 + spacing)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function KineticType() {
  const section = useAppStore((s) => s.section)
  const view = useAppStore((s) => s.view)
  const loadPhase = useAppStore((s) => s.loadPhase)
  const sectionDef = SECTIONS.find((s) => s.id === section)
  const word = sectionDef?.kineticWord_bottom ?? 'SIGNAL'
  const topWord = sectionDef?.kineticWord_top ?? ''
  const texture = useMemo(() => makeTexture(word), [word])
  const topTexture = useMemo(() => makeTexture(topWord), [topWord])

  const meshRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const topMeshRef = useRef<THREE.Group>(null)
  const topMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const introRef = useRef(0)
  const lastWordRef = useRef(`${word}:${topWord}`)

  useEffect(() => {
    const key = `${word}:${topWord}`
    if (key !== lastWordRef.current) {
      lastWordRef.current = key
      introRef.current = 0
    }
  }, [word, topWord])

  useFrame(({ clock }, dt) => {
    if (materialRef.current && materialRef.current.map !== texture) {
      materialRef.current.map = texture
      materialRef.current.needsUpdate = true
      introRef.current = 0
    }
    if (topMaterialRef.current && topMaterialRef.current.map !== topTexture) {
      topMaterialRef.current.map = topTexture
      topMaterialRef.current.needsUpdate = true
      introRef.current = 0
    }

    const target = loadPhase === 'access' ? 1 : 0
    introRef.current += (target - introRef.current) * (1 - Math.exp(-dt * 2.0))
    const intro = introRef.current
    const dim = view === 'detail' ? 0.35 : 1
    const scale = 0.88 + 0.12 * intro
    const opacity = 0.9 * intro * dim
    const x = KINETIC_X + Math.sin(clock.elapsedTime * 0.08) * 0.5

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale)
      meshRef.current.position.x = x
    }
    if (materialRef.current) materialRef.current.opacity = opacity
    if (topMeshRef.current) {
      topMeshRef.current.scale.setScalar(scale)
      topMeshRef.current.position.x = x
    }
    if (topMaterialRef.current) topMaterialRef.current.opacity = opacity * 0.8
  })

  const planeArgs: [number, number] = [PLANE_WIDTH, (HEIGHT / WIDTH) * PLANE_WIDTH]

  return (
    <>
      <group ref={meshRef} position={[KINETIC_X, 0, 0]} rotation-z={-0.035}>
        {Array.from({ length: DEPTH_LAYERS }, (_, index) => (
          <mesh key={`bottom-depth-${index}`} position={[0, 0.9, -16 - (index + 1) * DEPTH_STEP]} renderOrder={-3}>
            <planeGeometry args={planeArgs} />
            <meshBasicMaterial map={texture} color="#e8e8e8" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} fog />
          </mesh>
        ))}
        <mesh position={[0, 0.9, -16]} renderOrder={-2}>
          <planeGeometry args={planeArgs} />
          <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} fog />
        </mesh>
      </group>
      {topWord && (
        <group ref={topMeshRef} position={[KINETIC_X, 0, 0]} rotation-z={-0.035}>
          {Array.from({ length: DEPTH_LAYERS }, (_, index) => (
            <mesh key={`top-depth-${index}`} position={[0, 5, -16 - (index + 1) * DEPTH_STEP]} renderOrder={-3}>
              <planeGeometry args={planeArgs} />
              <meshBasicMaterial map={topTexture} color="#e8e8e8" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} fog />
            </mesh>
          ))}
          <mesh position={[0, 5, -16]} renderOrder={-2}>
            <planeGeometry args={planeArgs} />
            <meshBasicMaterial ref={topMaterialRef} map={topTexture} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} fog />
          </mesh>
        </group>
      )}
    </>
  )
}
