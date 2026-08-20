import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { LightPillar } from './LightPillar'

type VfxChoice = 'high' | 'low'

export function PreScreen({ onStart }: { onStart: () => void }) {
  const currentLowFx = useAppStore((s) => s.lowFx)
  const currentBgmVolume = useAppStore((s) => s.bgmVolume)
  const currentSfxVolume = useAppStore((s) => s.sfxVolume)
  const setLowFx = useAppStore((s) => s.setLowFx)
  const setBgmVolume = useAppStore((s) => s.setBgmVolume)
  const setSfxVolume = useAppStore((s) => s.setSfxVolume)
  const [choice, setChoice] = useState<VfxChoice>(() => (currentLowFx ? 'low' : 'high'))
  const [audioChoice, setAudioChoice] = useState(() => currentBgmVolume > 0 && currentSfxVolume > 0)
  const [leaving, setLeaving] = useState(false)

  // Mount the WebGL pillar a beat after first paint so its shader compile can
  // never stall the pre-screen's entrance / main thread on a cold load.
  const [showPillar, setShowPillar] = useState(false)
  // Measured seam angle (degrees, from vertical) so the divider line always
  // stays parallel to the choice-card diagonals at any size / breakpoint.
  const [seamAngle, setSeamAngle] = useState(12)
  const choicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setShowPillar(true), 300)
    return () => window.clearTimeout(id)
  }, [])

  // Re-derive --seam-angle from the real card geometry whenever the group
  // resizes (the diagonal spans `--seam-cut` of card width across its height).
  useEffect(() => {
    const group = choicesRef.current
    if (!group) return
    const measure = () => {
      const card = group.querySelector<HTMLElement>('.pre-screen__vfx-choice')
      if (!card) return
      const rect = card.getBoundingClientRect()
      const cut = parseFloat(getComputedStyle(card).getPropertyValue('--seam-cut')) || 5.5
      if (rect.width > 0 && rect.height > 0) {
        // atan2(dx, dy) — the diagonal's horizontal span (--seam-cut of card
        // width) across its height, measured FROM VERTICAL so the divider
        // stays a near-vertical line tilted like the card diagonals.
        setSeamAngle((Math.atan2((cut / 100) * rect.width, rect.height) * 180) / Math.PI)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(group)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setChoice(currentLowFx ? 'low' : 'high')
    setAudioChoice(currentBgmVolume > 0 && currentSfxVolume > 0)
  }, [currentBgmVolume, currentLowFx, currentSfxVolume])

  const confirm = () => {
    setLowFx(choice === 'low')
    setBgmVolume(audioChoice ? 0.5 : 0)
    setSfxVolume(audioChoice ? 0.8 : 0)
    setLeaving(true)
  }

  // The pre-screen is never hidden behind a JS animation: with initial={false}
  // it renders at opacity 1 immediately (framer-motion only drives the exit),
  // and the entrance fade is a pure CSS animation so a stalled main thread on
  // a cold load can no longer leave a blank screen.
  const seamVars: Record<string, string> = {
    '--seam-angle': `${seamAngle}deg`,
    '--seam-angle-neg': `${-seamAngle}deg`,
  }

  return (
    <motion.main
      className="pre-screen"
      style={seamVars}
      initial={false}
      animate={
        leaving
          ? { opacity: 0, scale: 1.08, filter: 'blur(10px)' }
          : { opacity: 1, scale: 1, filter: 'blur(0px)' }
      }
      transition={{ duration: leaving ? 0.75 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        if (leaving) onStart()
      }}
    >
      {showPillar && (
        <div className="pre-screen__pillar" aria-hidden="true">
        <LightPillar
          topColor="#F43F5E"
          bottomColor="#3B82F6"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={90}
          mixBlendMode="screen"
          quality={choice === 'low' ? 'low' : 'high'}
        />
        </div>
      )}
      <div className="pre-screen__wash" aria-hidden="true" />
      <section className="pre-screen__content" aria-labelledby="pre-screen-title">
        <h1 id="pre-screen-title">P O R T F O L I O</h1>
        <div className="pre-screen__divider" aria-hidden="true" />
        <p className="pre-screen__intro">Please select the following options</p>

        <div className="pre-screen__control-group">
          <div className="pre-screen__control-label">VFX TOGGLE</div>
          <div
            ref={choicesRef}
            className={`pre-screen__choices ${choice === 'high' ? 'is-high' : 'is-low'}`}
            role="group"
            aria-label="Visual effects mode"
          >
          <button
            type="button"
            className={`pre-screen__vfx-choice ${choice === 'high' ? 'is-selected' : ''}`}
            aria-pressed={choice === 'high'}
            onClick={() => setChoice('high')}
          >
            <span className="pre-screen__vfx-label">HIGH VFX</span>
            <span className="pre-screen__vfx-caption">Recommended for the full visual experience.</span>
          </button>
          <button
            type="button"
            className={`pre-screen__vfx-choice ${choice === 'low' ? 'is-selected' : ''}`}
            aria-pressed={choice === 'low'}
            onClick={() => setChoice('low')}
          >
            <span className="pre-screen__vfx-label">LOW VFX</span>
              <span className="pre-screen__vfx-caption">Recommended for lower-end devices.</span>
          </button>
          </div>
        </div>

        <div className="pre-screen__control-group pre-screen__control-group--audio">
          <div className="pre-screen__control-label">AUDIO TOGGLE</div>
          <div
            className={`pre-screen__choices ${audioChoice ? 'is-high' : 'is-low'}`}
            role="group"
            aria-label="Audio mode"
          >
            <button
              type="button"
              className={`pre-screen__vfx-choice ${audioChoice ? 'is-selected' : ''}`}
              aria-pressed={audioChoice}
              onClick={() => setAudioChoice(true)}
            >
              <span className="pre-screen__vfx-label">ENABLE AUDIO</span>
              <span className="pre-screen__vfx-caption">Music and sound effects enabled.</span>
            </button>
            <button
              type="button"
              className={`pre-screen__vfx-choice ${!audioChoice ? 'is-selected' : ''}`}
              aria-pressed={!audioChoice}
              onClick={() => setAudioChoice(false)}
            >
              <span className="pre-screen__vfx-label">DISABLE AUDIO</span>
              <span className="pre-screen__vfx-caption">Enter the experience silently.</span>
            </button>
          </div>
        </div>

        <p className="pre-screen__disclaimer">You can change these settings later in the experience</p>
        <button type="button" className="pre-screen__start" onClick={confirm} disabled={leaving}>
          <span className="pre-screen__start-inner" aria-hidden="true" />
          <span>START EXPERIENCE</span>
        </button>
      </section>
    </motion.main>
  )
}
