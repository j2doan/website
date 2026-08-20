import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTIONS } from '../../config/sections'
import { useAppStore } from '../../store/useAppStore'

const WIDTH = 4096
const HEIGHT = 420
const PLANE_WIDTH = 77.33

function makeTexture(word: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
    grad.addColorStop(0, 'rgba(240, 244, 255, 0.2)')
    grad.addColorStop(0.55, 'rgba(240, 244, 255, 0.07)')
    grad.addColorStop(1, 'rgba(240, 244, 255, 0)')
    ctx.fillStyle = grad
    ctx.font = '900 230px "Segoe UI", "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const spacing = 0.09
    const widths: number[] = []
    for (const char of word) {
      widths.push(ctx.measureText(char).width)
    }
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

  const word =
    SECTIONS.find((s) => s.id === section)?.kineticWord ?? 'SIGNAL'
  const texture = useMemo(() => makeTexture(word), [word])

  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const introRef = useRef(0)
  const lastWordRef = useRef(word)

  useEffect(() => {
    if (word !== lastWordRef.current) {
      lastWordRef.current = word
      introRef.current = 0
    }
  }, [word])

  useFrame(({ clock }, dt) => {
    if (materialRef.current && materialRef.current.map !== texture) {
      materialRef.current.map = texture
      materialRef.current.needsUpdate = true
      introRef.current = 0
    }

    const target = loadPhase === 'access' ? 1 : 0
    introRef.current += (target - introRef.current) * (1 - Math.exp(-dt * 2.0))

    const intro = introRef.current
    const dim = view === 'detail' ? 0.35 : 1
    const scale = 0.88 + 0.12 * intro
    const opacity = 0.9 * intro * dim

    const mesh = meshRef.current
    if (mesh) {
      mesh.scale.setScalar(scale)
      const t = clock.elapsedTime
      mesh.position.x = -16 + Math.sin(t * 0.08) * 0.5
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity
    }
  })

  return (
    <mesh ref={meshRef} position={[-16, 0.9, -16]} rotation-z={-0.035} renderOrder={-2}>
      <planeGeometry args={[PLANE_WIDTH, HEIGHT / WIDTH * PLANE_WIDTH]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        fog={true}
      />
    </mesh>
  )
}
