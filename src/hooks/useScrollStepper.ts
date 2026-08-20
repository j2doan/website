import { useEffect } from 'react'
import { SECTION_ORDER, useAppStore } from '../store/useAppStore'
import { clamp01, scrollState } from '../scroll/scroll'
import { isTransitionLocked } from '../three/transitionLock'
import { AudioManager } from '../audio/AudioManager'
import { SFX } from '../audio/AudioConfig'

// Let elements with their own working vertical scroller consume the wheel
// instead of treating that input as section navigation.
function isWithinScrollable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  let node: Element | null = target
  while (node && node !== document.documentElement) {
    const overflowY = window.getComputedStyle(node).overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return true
    }
    node = node.parentElement
  }
  return false
}

export function useScrollStepper() {
  const loadPhase = useAppStore((s) => s.loadPhase)
  const view = useAppStore((s) => s.view)

  useEffect(() => {
    if (loadPhase !== 'access') return

    // Move through the section timeline and play feedback when a boundary is
    // crossed.
    const stepSection = (delta: number) => {
      const prev = Math.round(scrollState.target * (SECTION_ORDER.length - 1))
      scrollState.target = clamp01(scrollState.target + delta)
      const next = Math.round(scrollState.target * (SECTION_ORDER.length - 1))
      if (next !== prev) AudioManager.playSfx(SFX.section)
    }

    const onWheel = (e: WheelEvent) => {
      if (view !== 'overview') return
      if (isWithinScrollable(e.target)) return
      if (isTransitionLocked()) return
      e.preventDefault()
      stepSection(e.deltaY * 0.0005)
    }

    const onKey = (e: KeyboardEvent) => {
      if (view !== 'overview') return
      if (isTransitionLocked()) return
      const down = e.key === 'ArrowDown' || e.key === 'ArrowRight'
      const up = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
      if (down) stepSection(0.08)
      else if (up) stepSection(-0.08)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [loadPhase, view])
}
