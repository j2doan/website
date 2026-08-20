import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { transitionToSection } from '../three/TransitionManager'
import { acquireTransitionLock } from '../three/transitionLock'
import { SECTIONS } from '../config/sections'

/**
 * Number-key section shortcuts generated from the section registry
 * so reordering/adding/removing sections updates the mapping automatically:
 * 0 → first section, 1 → second, ... n → last.
 *
 * - Ignored while typing in any input/textarea/select or contentEditable.
 * - Uses the normal camera transition (same path as a nav click).
 * - If a project is open, behaves like clicking the nav item: closes it and
 *   navigates (transitionToSection resets view to overview).
 */
export function useKeyboardShortcuts() {
  const loadPhase = useAppStore((s) => s.loadPhase)

  useEffect(() => {
    if (loadPhase !== 'access') return

    const shortcutMap = new Map<string, number>()
    SECTIONS.forEach((_, i) => shortcutMap.set(String(i), i))

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return
        }
      }
      const index = shortcutMap.get(e.key)
      if (index !== undefined) {
        if (!acquireTransitionLock()) return
        transitionToSection(index)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loadPhase])
}
