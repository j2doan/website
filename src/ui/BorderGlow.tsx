import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react'
import './BorderGlow.css'

interface BorderGlowProps {
  children: ReactNode
  className?: string
  edgeSensitivity?: number
  glowColor?: string
  backgroundColor?: string
  borderRadius?: number
  glowRadius?: number
  glowIntensity?: number
  coneSpread?: number
  animated?: boolean
  colors?: string[]
}

export function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
}: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const edge = Math.min(x, y, rect.width - x, rect.height - y)
    const proximity = Math.max(0, Math.min(100, (1 - edge / edgeSensitivity) * 100))
    const angle = (Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180) / Math.PI + 90
    element.style.setProperty('--edge-proximity', proximity.toFixed(2))
    element.style.setProperty('--cursor-angle', `${angle < 0 ? angle + 360 : angle}deg`)
  }, [edgeSensitivity])

  const style = {
    '--card-bg': backgroundColor,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--edge-sensitivity': edgeSensitivity,
    '--cone-spread': coneSpread,
    '--glow-intensity': glowIntensity,
    '--glow-hsl': (() => {
      const [h = '40', s = '80', l = '80'] = glowColor.trim().split(/\s+/)
      return `hsl(${h}deg ${s}% ${l}% / 100%)`
    })(),
    '--gradient-one': `radial-gradient(at 80% 55%, ${colors[0]} 0, transparent 52%)`,
    '--gradient-two': `radial-gradient(at 20% 30%, ${colors[1]} 0, transparent 52%)`,
    '--gradient-three': `radial-gradient(at 50% 100%, ${colors[2]} 0, transparent 52%)`,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={`border-glow-card ${className}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        ref.current?.style.setProperty('--edge-proximity', '0')
      }}
    >
      <span className="border-glow-card__light" aria-hidden="true" />
      <div className="border-glow-card__inner">{children}</div>
    </div>
  )
}
