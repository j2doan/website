import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAppStore } from '../store/useAppStore'

// ---------------------------------------------------------------------------
// AdaptiveQuality
//
// Frame-time watchdog: samples a rolling average of frame duration and steps
// the renderer pixel ratio up/down so the experience holds a playable frame
// rate instead of dropping frames hard. Uses R3F's setDpr, so the renderer,
// camera aspect and postprocessing buffers all re-size together.
// ---------------------------------------------------------------------------

const DPR_STEPS = [0.75, 1, 1.25, 1.5, 2]
/** Sustained average above this (~54fps) steps the pixel ratio down. */
const MAX_FRAME_MS = 18.5
/** Sustained average below this (~74fps) allows stepping back up. */
const RAISE_FRAME_MS = 13.5
/** Minimum time between adjustments, so a single hitch can't trigger changes. */
const SETTLE_MS = 900
const EMA_FACTOR = 0.08

function nearestStep(value: number): number {
  let best = DPR_STEPS[0]
  for (const step of DPR_STEPS) {
    if (Math.abs(step - value) < Math.abs(best - value)) best = step
  }
  return best
}

export function AdaptiveQuality() {
  const setDpr = useThree((state) => state.setDpr)
  const cap = useAppStore((state) => (state.lowFx ? 1 : state.quality.dpr))
  const lowFx = useAppStore((state) => state.lowFx)

  const frameMs = useRef(16)
  const effective = useRef(cap)
  const lastStep = useRef(0)

  useFrame((_, dt) => {
    if (lowFx) return
    frameMs.current += (dt * 1000 - frameMs.current) * EMA_FACTOR

    const now = performance.now()
    if (now - lastStep.current < SETTLE_MS) return

    let next = effective.current
    if (frameMs.current > MAX_FRAME_MS) {
      next = Math.max(DPR_STEPS[0], nearestStep(effective.current * 0.75))
    } else if (frameMs.current < RAISE_FRAME_MS && effective.current < cap) {
      next = Math.min(cap, nearestStep(effective.current * 1.25))
    }

    if (next !== effective.current) {
      effective.current = next
      setDpr(next)
    }
    lastStep.current = now
  })

  return null
}
