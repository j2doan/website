import { useCallback, useEffect, useRef } from 'react'
import { useAppStore, type LoadPhase } from '../store/useAppStore'

// ---------------------------------------------------------------------------
// useEmergenceSequence
//
// Cinematic introduction of the hero's emergence sequence:
// after START the scene opens in CHAOS (particles scattered), then advances
// FORMATION -> ACTIVATION -> ACCESS on a timer. Any pointer/key gesture during
// the sequence skips straight to ACCESS so impatient visitors aren't held up.
// ---------------------------------------------------------------------------

interface Step {
  phase: LoadPhase
  at: number
}

const STEPS: Step[] = [
  { phase: 'formation', at: 1400 },
  { phase: 'activation', at: 2600 },
  { phase: 'access', at: 3600 },
]

export function useEmergenceSequence() {
  const setLoadPhase = useAppStore((s) => s.setLoadPhase)
  const timers = useRef<number[]>([])

  const clear = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const start = useCallback(() => {
    clear()
    setLoadPhase('chaos')
    STEPS.forEach(({ phase, at }) => {
      timers.current.push(window.setTimeout(() => setLoadPhase(phase), at))
    })
  }, [clear, setLoadPhase])

  const skip = useCallback(() => {
    clear()
    setLoadPhase('access')
  }, [clear, setLoadPhase])

  useEffect(() => clear, [clear])

  return { start, skip }
}
