import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import * as THREE from 'three'
import './LightPillar.css'

export type LightPillarQuality = 'low' | 'medium' | 'high'

interface LightPillarProps {
  topColor?: string
  bottomColor?: string
  intensity?: number
  rotationSpeed?: number
  interactive?: boolean
  className?: string
  glowAmount?: number
  pillarWidth?: number
  pillarHeight?: number
  noiseIntensity?: number
  mixBlendMode?: CSSProperties['mixBlendMode']
  pillarRotation?: number
  quality?: LightPillarQuality
}

const QUALITY = {
  low: { iterations: 24, pixelRatio: 0.5, stepMultiplier: 1.5 },
  medium: { iterations: 40, pixelRatio: 0.65, stepMultiplier: 1.2 },
  high: {
    iterations: 80,
    pixelRatio: Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 2),
    stepMultiplier: 1,
  },
} as const

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

function fragmentShader(iterations: number, stepMultiplier: number): string {
  return /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uIntensity;
uniform float uGlowAmount;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform float uNoiseIntensity;
uniform float uRotCos;
uniform float uRotSin;
uniform float uPillarRotCos;
uniform float uPillarRotSin;
varying vec2 vUv;

void main() {
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y,
            uPillarRotSin * uv.x + uPillarRotCos * uv.y);
  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  vec3 col = vec3(0.0);
  float t = 0.1;

  for (int i = 0; i < ${iterations}; i++) {
    vec3 p = ro + rd * t;
    p.xz = vec2(uRotCos * p.x - uRotSin * p.z,
                uRotSin * p.x + uRotCos * p.z);
    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;
    q.xz = vec2(cos(0.4) * q.x - sin(0.4) * q.z,
                sin(0.4) * q.x + cos(0.4) * q.z);
    q += cos(q.zxy - uTime * 2.0);

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float k = 4.0;
    float h = max(k - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.0625 / k;
    d = abs(d) * 0.15 + 0.01;
    float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);
    col += mix(uBottomColor, uTopColor, grad) / d;
    t += d * ${stepMultiplier.toFixed(1)};
    if (t > 50.0) break;
  }

  float widthNorm = uPillarWidth / 3.0;
  col = tanh(col * uGlowAmount / widthNorm);
  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453)
    / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(max(col * uIntensity, 0.0), 1.0);
}
`
}

function colorVector(hex: string): THREE.Vector3 {
  const color = new THREE.Color(hex)
  return new THREE.Vector3(color.r, color.g, color.b)
}

export function LightPillar({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  intensity = 1,
  rotationSpeed = 0.3,
  className = '',
  glowAmount = 0.005,
  pillarWidth = 3,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = 'screen',
  pillarRotation = 0,
  quality = 'high',
}: LightPillarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    setSupported(Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !supported) return

    const settings = QUALITY[quality]
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    let renderer: THREE.WebGLRenderer

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        depth: false,
        stencil: false,
        powerPreference: quality === 'high' ? 'high-performance' : 'low-power',
      })
    } catch {
      setSupported(false)
      return
    }

    renderer.setPixelRatio(settings.pixelRatio)
    renderer.setSize(width, height, false)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: fragmentShader(settings.iterations, settings.stepMultiplier),
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTopColor: { value: colorVector(topColor) },
        uBottomColor: { value: colorVector(bottomColor) },
        uIntensity: { value: intensity },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos: { value: 1 },
        uRotSin: { value: 0 },
        uPillarRotCos: { value: Math.cos((pillarRotation * Math.PI) / 180) },
        uPillarRotSin: { value: Math.sin((pillarRotation * Math.PI) / 180) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geometry, material))

    let frame = 0
    let lastTime = performance.now()
    const animate = (now: number) => {
      const delta = now - lastTime
      if (delta >= 1000 / (quality === 'low' ? 30 : 60)) {
        const time = now * 0.001 * rotationSpeed
        material.uniforms.uTime.value = time
        material.uniforms.uRotCos.value = Math.cos(time * 0.3)
        material.uniforms.uRotSin.value = Math.sin(time * 0.3)
        renderer.render(scene, camera)
        lastTime = now - (delta % (1000 / (quality === 'low' ? 30 : 60)))
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(1, container.clientWidth)
      const nextHeight = Math.max(1, container.clientHeight)
      renderer.setSize(nextWidth, nextHeight, false)
      material.uniforms.uResolution.value.set(nextWidth, nextHeight)
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [quality, supported, topColor, bottomColor, intensity, rotationSpeed, glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation])

  if (!supported) {
    return <div className={`light-pillar-fallback ${className}`} style={{ mixBlendMode }} />
  }

  return <div ref={containerRef} className={`light-pillar-container ${className}`} style={{ mixBlendMode }} />
}
