import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { useAudio, SFX } from '../audio/useAudio'
import { SpeakerIcon, GearIcon } from './icons'

function volumeLevel(value: number): 0 | 1 | 2 | 3 {
  if (value <= 0) return 0
  if (value < 0.34) return 1
  if (value < 0.67) return 2
  return 3
}

function VolumeRow({
  label,
  value,
  onChange,
  onAudition,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onAudition?: () => void
}) {
  const level = volumeLevel(value)
  return (
    <div className="system__row">
      <div className="system__row-head">
        <span className="system__row-label">{label}</span>
        <span className="system__row-value">{value <= 0 ? 'MUTED' : `${Math.round(value * 100)}`}</span>
      </div>
      <div className="system__row-control">
        <button
          type="button"
          aria-label={`${label}: mute`}
          title={`${label}: mute`}
          onClick={() => onChange(0)}
          className={`system__icon ${level === 0 ? 'is-muted' : ''}`}
        >
          <SpeakerIcon level={level} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          aria-label={`${label} volume`}
          className="system__slider"
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={onAudition}
          onKeyUp={onAudition}
        />
      </div>
    </div>
  )
}

export function SystemPanel() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { playSfx } = useAudio()

  const bgmVolume = useAppStore((s) => s.bgmVolume)
  const sfxVolume = useAppStore((s) => s.sfxVolume)
  const lowFx = useAppStore((s) => s.lowFx)
  const setBgmVolume = useAppStore((s) => s.setBgmVolume)
  const setSfxVolume = useAppStore((s) => s.setSfxVolume)
  const setLowFx = useAppStore((s) => s.setLowFx)

  const close = () => {
    if (open) {
      setOpen(false)
      playSfx(SFX.modalClose)
    }
  }

  // Close the popup when focus moves outside it or Escape is pressed.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        // The system panel is the topmost dialog — consume Escape so panels
        // beneath (e.g. a focused project) stay open until it is closed.
        e.stopPropagation()
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey, { capture: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="system" ref={rootRef}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="system__panel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="System settings"
          >
            <div className="system__section">
              <div className="system__heading">AUDIO</div>
              <VolumeRow
                label="BGM"
                value={bgmVolume}
                onChange={setBgmVolume}
                onAudition={() => playSfx(SFX.sfxTest)}
              />
              <VolumeRow
                label="SFX"
                value={sfxVolume}
                onChange={setSfxVolume}
                onAudition={() => playSfx(SFX.sfxTest)}
              />
            </div>
            <div className="system__section">
              <div className="system__heading">PERFORMANCE</div>
              <div className="system__row system__row--switch">
                <span className="system__row-label">LOW VISUAL FX</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lowFx}
                  aria-label="Low visual effects"
                  className={lowFx ? 'switch is-on' : 'switch'}
                  onClick={() => {
                    const next = !lowFx
                    setLowFx(next)
                    playSfx(next ? SFX.toggleOn : SFX.toggleOff)
                  }}
                >
                  <span className="switch__knob" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        className={`system__toggle ${open ? 'is-open' : ''}`}
        aria-label="System settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          const next = !open
          setOpen(next)
          playSfx(next ? SFX.modalOpen : SFX.modalClose)
        }}
      >
        <GearIcon size={16} />
      </button>
    </div>
  )
}
